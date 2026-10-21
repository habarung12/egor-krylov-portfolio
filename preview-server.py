from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
import os,sys
port=4173
for i,x in enumerate(sys.argv):
 if x in ('--port','-p') and i+1<len(sys.argv): port=int(sys.argv[i+1])
os.chdir(os.path.dirname(__file__))
ThreadingHTTPServer(('0.0.0.0',port),SimpleHTTPRequestHandler).serve_forever()
