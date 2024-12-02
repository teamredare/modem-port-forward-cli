#!/usr/bin/env node
const loginTime = 60 * 1000 // stay logged in for one minute

let args = process.argv.slice(2)

const OP = args[0] // add, remove, list
const ARGS = args.slice(1);

process.removeAllListeners('warning');
import puppeteer from 'puppeteer';
import fs from 'fs'
import readline from 'readline/promises';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const sessionIdFile = "sessionId.json"
const modemPasswordFile = 'owiejfslkdfjsd.txt'
let sessionId = null;

async function login() {

    let sessionIdObj = fs.existsSync(sessionIdFile) ? JSON.parse(fs.readFileSync(sessionIdFile)) : null;
    if ((Date.now() - sessionIdObj?.time) < loginTime) { sessionId = sessionIdObj.sessionId }
    if (sessionId) { return; }

    // get modem password from user
    let username;
    let password;
    try {
        let file = fs.readFileSync(modemPasswordFile).toString();
        file = file.split('\n')
        username = file[0]
        password = file[1]
    } catch (e) { }
    if (!(username && password)) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        username = await rl.question('What is the modem admin username? (default = admin)\n')
        if(new String(username).trim() == '') username = 'admin'
        password = await rl.question('What is the modem admin password?\n')

        fs.writeFileSync(modemPasswordFile,`${username}\n${password}`)

        console.log('creds stored. authenticating...')
        console.log()
    }



    let sleep = (m) => { return new Promise(res => setTimeout(res, m)) }
    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch({
        headless: true,
        ignoreHTTPSErrors: true
    });
    const page = await browser.newPage();
    // Navigate the page to a URL.
    await page.goto('https://192.168.0.1/index.html', { ignoreSSL: true });

    // Set screen size.
    await page.setViewport({ width: 1080, height: 1024 });

    // Type into search box.
    await page.locator('#Login_Password_TextInput').fill(password);

    // Wait and click on first result.
    await page.locator('#Login_Apply_Button').click();

    await sleep(60)

    async function getSessionId() {
        return (await page.cookies()).find(c => c.name == 'Session-Id')?.value
    }

    while (!(sessionId = await getSessionId())) { await sleep(60) }

    await browser.close()

    sessionIdObj = { sessionId, time: Date.now() }
    fs.writeFileSync(sessionIdFile, JSON.stringify(sessionIdObj))

}



// console.log(sessionId)

switch (OP) {
    case 'add':
        if (ARGS.length < 2) console.log(`usage: portforward add internal_ip external_port [destination_port] [protocol]\n\example: pf add pc 2022 2022 tcp`)
        else console.log('success:', await portForward(...ARGS));
        break
    case 'remove':
    case 'rm':
        if (ARGS.length != 1) console.log(`usage: portforward remove entry_id\n\texample: pf remove 12`)
        else console.log('success:', await removePortEntry(...ARGS));
        break;
    case 'list':
    case 'ls':
        await listMappings();
        break;
    default:
        console.log('welcome to portfoward util. use one of the following subcommands:\nadd remove ls')
}

async function listMappings() {
    console.log()
    let mappings = (await getPortMappings()).Objects;
    // console.log(mappings)
    let data = mappings.map(thing => ({
        name: thing.ObjName,
        id: thing.ObjName.replace('Device.NAT.PortMapping.', ''),
        status: thing.Param.find(d => d.ParamName == 'Status').ParamValue,
        from: thing.Param.find(d => d.ParamName == 'ExternalPort').ParamValue,
        to: thing.Param.find(d => d.ParamName == 'InternalPort').ParamValue,
        protocol: thing.Param.find(d => d.ParamName == 'Protocol').ParamValue,
        interface: thing.Param.find(d => d.ParamName == 'X_LANTIQ_COM_INTERFACE').ParamValue,
        ip: thing.Param.find(d => d.ParamName == 'InternalClient').ParamValue,
    }))
    // console.log(data);
    let response = data.map(e => `${e.ip}: \t${e.from} => ${e.to} \t[${e.status}] \t${e.name}`).join('\n')

    console.log(`dest ip \text to int \tstatus\t\tname`)
    console.log(response)
    console.log('')
}

async function getPortMappings() {
    await login()
    let res = await fetch("https://192.168.0.1/cgi/cgi_get?Object=Device.NAT.PortMapping", {
        "headers": {
            "accept": "application/json, text/javascript, */*; q=0.01",
            "accept-language": "en-US,en;q=0.9",
            "cache-control": "no-cache",
            "pragma": "no-cache",
            "sec-ch-ua": "\"Not/A)Brand\";v=\"8\", \"Chromium\";v=\"126\", \"Google Chrome\";v=\"126\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest",
            "cookie": `Session-Id=${sessionId}`,
            "Referer": "https://192.168.0.1/advancedsetup_advancedportforwarding.html",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": null,
        "method": "GET"
    });

    let json = await res.json()
    return json;

    //     return new Promise(hey=>{
    //     page.evaluate(async () => {

    //         let res = await fetch("https://192.168.0.1/cgi/cgi_get?Object=Device.NAT.PortMapping", {
    //             "headers": {
    //               "accept": "application/json, text/javascript, */*; q=0.01",
    //               "accept-language": "en-US,en;q=0.9",
    //               "cache-control": "no-cache",
    //               "pragma": "no-cache",
    //               "sec-ch-ua": "\"Not/A)Brand\";v=\"8\", \"Chromium\";v=\"126\", \"Google Chrome\";v=\"126\"",
    //               "sec-ch-ua-mobile": "?0",
    //               "sec-ch-ua-platform": "\"macOS\"",
    //               "sec-fetch-dest": "empty",
    //               "sec-fetch-mode": "cors",
    //               "sec-fetch-site": "same-origin",
    //               "x-requested-with": "XMLHttpRequest"
    //             },
    //             "referrer": "https://192.168.0.1/advancedsetup_advancedportforwarding.html",
    //             "referrerPolicy": "strict-origin-when-cross-origin",
    //             "body": null,
    //             "method": "GET",
    //             "mode": "cors",
    //             "credentials": "include"
    //           });

    //           let json = await res.json()
    //           hey(json)
    //     })


    // })
}

async function portForward(ip, fromPort, toPort, protocol) {
    await login()
    if (!toPort) toPort = fromPort
    if (!protocol) protocol = 'TCP'
    protocol = protocol.toUpperCase()
    if (ip == 'pc') ip = '192.168.0.40'

    let res = await fetch("https://192.168.0.1/cgi/cgi_set", {
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
            "cookie": `Session-Id=${sessionId}`,
            "Referer": "https://192.168.0.1/configuring_applysettings.html",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": `Object=Device.NAT.PortMapping&Operation=Add&AllInterfaces=0&RemoteHost=&X_LANTIQ_COM_INTERFACE=wan&ExternalPort=${fromPort}&ExternalPortEndRange=${toPort}&InternalPort=${toPort}&InternalClient=${ip}&Enable=1&Description=PortMapping_10&X_GWS_Via=UI&Protocol=${protocol}`,
        "method": "POST"
    });

    let json = await res.json()
    let success = json.Objects[0].Param[0].ParamValue == 'Success'
    return success;

}

async function removePortEntry(id) {
    await login()
    let name = `Device.NAT.PortMapping.${id}`
    let res = await fetch("https://192.168.0.1/cgi/cgi_set", {
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
            "cookie": `Session-Id=${sessionId}`,
            "Referer": "https://192.168.0.1/configuring_applysettings.html",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": `Object=${name}&Operation=Del&`,
        "method": "POST"
    });

    let json = await res.json()

    let success = json.Objects[0].Param[0].ParamValue == 'Success'
    return success;
}

// Locate the full title with a unique string.
// const textSelector = await page
//   .locator('text/Customize and automate')
//   .waitHandle();
// const fullTitle = await textSelector?.evaluate(el => el.textContent);

// Print the full title.
