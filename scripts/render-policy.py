#!/usr/bin/env python3
import argparse,plistlib,re
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('extension_id');p.add_argument('--update-url',default='https://nfvcsd.github.io/eaglercraft-blocker/updates.xml');p.add_argument('--output',default='.dist/com.google.Chrome.plist');a=p.parse_args()
if not re.fullmatch('[a-p]{32}',a.extension_id):p.error('Expected 32-character extension ID derived from signing key')
if not a.update_url.startswith('https://'):p.error('HTTPS required')
t=Path(__file__).resolve().parents[1]/'deploy/com.google.Chrome.plist.template'
d=plistlib.loads(t.read_bytes());entry=d['ExtensionSettings'].pop('REPLACE_WITH_SIGNING_KEY_EXTENSION_ID');entry['update_url']=a.update_url;d['ExtensionSettings'][a.extension_id]=entry
out=Path(a.output);out.parent.mkdir(parents=True,exist_ok=True);out.write_bytes(plistlib.dumps(d));print(out)
