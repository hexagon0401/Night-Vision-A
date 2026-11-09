"""Small explicit development/Alpha HTTP budgets; no proxy-header identity trust."""
from collections import defaultdict,deque
import time
from starlette.responses import JSONResponse

class RequestBudgets:
    def __init__(self,app):self.app=app;self.windows=defaultdict(deque)
    async def __call__(self,scope,receive,send):
        if scope['type']!='http':return await self.app(scope,receive,send)
        now=time.monotonic();client=(scope.get('client') or ('unknown',))[0]
        if len(self.windows)>1024:
            self.windows={k:v for k,v in self.windows.items() if v and v[-1]>now-60}
            self.windows=defaultdict(deque,self.windows)
            if len(self.windows)>1024:return await JSONResponse({'detail':'Client capacity reached'},status_code=429)(scope,receive,send)
        window=self.windows[client]
        while window and window[0]<now-60:window.popleft()
        if len(window)>=120:return await JSONResponse({'detail':'Request rate limit'},status_code=429,headers={'Retry-After':'60'})(scope,receive,send)
        window.append(now)
        if scope['method'] in ('POST','PUT','PATCH'):
            body=bytearray()
            while True:
                message=await receive()
                if message['type']=='http.disconnect':return
                chunk=message.get('body',b'')
                if len(body)+len(chunk)>8000000:return await JSONResponse({'detail':'Request body budget exceeded'},status_code=413)(scope,receive,send)
                body.extend(chunk)
                if not message.get('more_body',False):break
            used=False
            async def buffered():
                nonlocal used
                if not used:used=True;return {'type':'http.request','body':bytes(body),'more_body':False}
                return await receive()
            return await self.app(scope,buffered,send)
        return await self.app(scope,receive,send)
