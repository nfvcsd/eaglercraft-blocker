#!/usr/bin/env python3
"""Pack with Chrome's CRX3 signer; never generate a replacement key implicitly."""
import argparse,base64,hashlib,json,os,re,shutil,struct,subprocess,tempfile,zipfile,io
from pathlib import Path
import xml.etree.ElementTree as ET
p=argparse.ArgumentParser()
p.add_argument('--key',required=True);p.add_argument('--chrome',required=True)
p.add_argument('--repository',default='nfvcsd/eaglercraft-blocker');p.add_argument('--expected-id')
a=p.parse_args(); root=Path(__file__).resolve().parents[1]; out=root/'.dist'
if not re.fullmatch(r'[\w.-]+/[\w.-]+',a.repository):p.error('Invalid repository')
key=Path(a.key).resolve(); chrome=str(Path(a.chrome).resolve())
pub=subprocess.check_output(['openssl','pkey','-in',str(key),'-pubout','-outform','DER'],stderr=subprocess.DEVNULL)
extid=''.join(chr(97+int(c,16)) for c in hashlib.sha256(pub).hexdigest()[:32])
if a.expected_id and extid!=a.expected_id: raise SystemExit('Signing key does not match expected extension ID')
m=json.loads((root/'extension/manifest.json').read_text());version=m['version']
if not re.fullmatch(r'\d+(?:\.\d+){0,3}',version) or any(int(v)>65535 for v in version.split('.')):raise SystemExit('Invalid Chrome version')
owner,repo=a.repository.split('/');m['update_url']=f'https://{owner}.github.io/{repo}/updates.xml'
m['key']=base64.b64encode(pub).decode()
out.mkdir(exist_ok=True)
with tempfile.TemporaryDirectory() as tmp:
    stage=Path(tmp)/'extension';shutil.copytree(root/'extension',stage)
    (stage/'manifest.json').write_text(json.dumps(m,indent=2)+'\n')
    subprocess.run([chrome,'--headless=new','--no-sandbox',f'--user-data-dir={tmp}/profile',f'--pack-extension={stage}',f'--pack-extension-key={key}'],check=True,timeout=60,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
    crx=stage.with_suffix('.crx').read_bytes()
    magic,v,size=struct.unpack('<4sII',crx[:12])
    assert magic==b'Cr24' and v==3,'Expected CRX3'
    with zipfile.ZipFile(io.BytesIO(crx[12+size:])) as z:
        assert json.loads(z.read('manifest.json'))['version']==version
    (out/'eaglercraft-blocker.crx').write_bytes(crx)
ns='http://www.google.com/update2/response';ET.register_namespace('',ns)
g=ET.Element('{'+ns+'}gupdate',protocol='2.0');app=ET.SubElement(g,'{'+ns+'}app',appid=extid)
ET.SubElement(app,'{'+ns+'}updatecheck',codebase=f'https://github.com/{a.repository}/releases/download/v{version}/eaglercraft-blocker.crx',version=version)
(out/'pages').mkdir(exist_ok=True);ET.ElementTree(g).write(out/'pages/updates.xml',encoding='UTF-8',xml_declaration=True)
(out/'pages/.nojekyll').touch()
(out/'extension-id.txt').write_text(extid+'\n')
(out/'SHA256SUMS').write_text(hashlib.sha256(crx).hexdigest()+'  eaglercraft-blocker.crx\n')
print(f'Built CRX3 {version}; extension ID {extid}')
