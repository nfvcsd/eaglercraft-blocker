#!/usr/bin/env python3
"""Anonymous HTTPS GET preflight, not proof of Chrome policy installation."""
import argparse,hashlib,json,struct,urllib.request,urllib.parse,xml.etree.ElementTree as ET
p=argparse.ArgumentParser();p.add_argument('update_url');p.add_argument('--expected-id',required=True);p.add_argument('--expected-sha256',required=True);a=p.parse_args()
class Redirects(urllib.request.HTTPRedirectHandler):
    def redirect_request(self,req,fp,code,msg,headers,newurl):
        if urllib.parse.urlsplit(newurl).scheme!='https':raise ValueError('Non-HTTPS redirect')
        # Do not record transient signed URL query strings.
        print(json.dumps({'redirect':code,'host':urllib.parse.urlsplit(newurl).hostname}))
        return super().redirect_request(req,fp,code,msg,headers,newurl)
opener=urllib.request.build_opener(Redirects())
def get(url,limit):
    if urllib.parse.urlsplit(url).scheme!='https':raise ValueError('HTTPS required')
    with opener.open(urllib.request.Request(url,headers={'User-Agent':'NFVCSD-pilot-preflight'}),timeout=30) as f:
        b=f.read(limit+1)
        if len(b)>limit:raise ValueError('Response too large')
        print(json.dumps({'status':f.status,'host':urllib.parse.urlsplit(f.url).hostname,'content-type':f.headers.get('Content-Type'),'nosniff':f.headers.get('X-Content-Type-Options'),'content-disposition':f.headers.get('Content-Disposition')}))
        return b
sep='&' if '?' in a.update_url else '?'
x=urllib.parse.urlencode({'x':f'id={a.expected_id}&v=0.0.0.0&uc'})
xml=get(a.update_url+sep+x,1024*1024);root=ET.fromstring(xml);ns={'g':'http://www.google.com/update2/response'}
app=root.find(f"g:app[@appid='{a.expected_id}']",ns)
if app is None:raise ValueError('Missing matching appid')
u=app.find('g:updatecheck',ns);data=get(u.attrib['codebase'],64*1024*1024)
assert struct.unpack('<4sI',data[:8])==(b'Cr24',3),'Not CRX3'
assert hashlib.sha256(data).hexdigest()==a.expected_sha256,'Downloaded asset differs from build'
print('Transport preflight PASS. Still requires a managed-Mac install AND version-update test.')
