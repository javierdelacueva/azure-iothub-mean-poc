# IoT Client
This angular client is based on ng2-admin from [Akveo team](http://akveo.com/).

Find the ng2-admin Github report<a target="_blank" href="http://akveo.com/ng2-admin/">here</a>.

This client uses two types of connections to receive data from backend. 

- A http request call to a REST backend method
- A websocket connection to get real time data from backend

I've cleaned up akveo's template and leave just two charts at the dashboard folder. There is a dashboard.service.ts file where both types of connections can be found.

## License
[MIT](LICENSE.txt) license.

