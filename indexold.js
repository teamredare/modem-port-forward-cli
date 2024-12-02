process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'




let res = await fetch("https://192.168.0.1/cgi/cgi_action", {
  // let res = await fetch("http://192.168.0.1", {
    "headers": {
      "accept": "*/*",
      "accept-language": "en-US,en;q=0.9",
      "cache-control": "no-cache",
      "content-type": "application/x-www-form-urlencoded",
      "pragma": "no-cache",
      // "sec-ch-ua": "\"Not/A)Brand\";v=\"8\", \"Chromium\";v=\"126\", \"Google Chrome\";v=\"126\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"macOS\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-requested-with": "XMLHttpRequest",
      "Cookie": "Session-Id=4331ea7af8e68994",
      "Referer": "https://192.168.0.1/login.html",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    },
    "body": "username=admin&password=sb2nA6AH",
    "method": "POST",
    // "method": "GET",
  });
  
  let text = await res.text()
  console.log('text',text)  
  let setCookies = res.headers
  console.log('headers',setCookies)  
  // console.log('body',res.body)  
// let json = await res.json()
// console.log('json',json)