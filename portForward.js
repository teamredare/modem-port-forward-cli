fetch("https://192.168.0.1/cgi/cgi_set", {
  "headers": {
    "accept": "application/json, text/javascript, */*; q=0.01",
    "accept-language": "en-US,en;q=0.9",
    "cache-control": "no-cache",
    "content-type": "application/x-www-form-urlencoded",
    "pragma": "no-cache",
    "sec-ch-ua": "\"Not/A)Brand\";v=\"8\", \"Chromium\";v=\"126\", \"Google Chrome\";v=\"126\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"macOS\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-requested-with": "XMLHttpRequest",
    "cookie": "Session-Id=4331ea7af8e68994",
    "Referer": "https://192.168.0.1/configuring_applysettings.html",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  },
  "body": "Object=Device.NAT.PortMapping&Operation=Add&AllInterfaces=0&RemoteHost=&X_LANTIQ_COM_INTERFACE=wan&ExternalPort=1540&ExternalPortEndRange=1540&InternalPort=1540&InternalClient=192.168.0.40&Enable=1&Description=PortMapping_10&X_GWS_Via=UI&Protocol=TCP",
  "method": "POST"
});