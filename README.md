# Basic oauth

A very simple oauth2 Node.js client for use with the Client Credentials flow based upon [simple-oauth2](https://github.com/lelylan/simple-oauth2).

By calling the http() method the user is able to have an [axios](https://github.com/axios/axios) instance returned with the oauth2 headers pre-defined.

Please be aware this this is almost exclusively designed for my personal requirements doesn't necessarily (easily) support advanced features of these libraries.

## Installation

Install the library using [npm](http://npmjs.org/):

```bash
npm install https://github.com/aaronheath/basic-oauth2.git
```

Install the library using [yarn](https://yarnpkg.com/):

```bash
yarn add https://github.com/aaronheath/basic-oauth2.git
```

## Configuration

Basic oauth supports the following configuration file structure.

```javascript
{
    "client": {
        "id": "client-id",
        "secret": "client-secret"
    },
    "auth": {
        "tokenHost": "host domain (https://example.com)"
    },
    "tls": {
        "validate": bool (optional)
    }
}
```

By default the configuration should be placed in a file named `.oauth-config.json` in the root directory of the project.

However, an option argument can be supplied ot the `oauthToken()` method (as displayed below), which represents the name of the project / service.

Where supplied, this name will be included this name will be expected within the configuration files name.

Example (code example in [Example of Usage](#example-of-usage) section):

* No project / service name supplied (default)
  * Filename: `.oauth-config.json`

* Project / service name supplied
  * Project name: `hermes`
  * Filename: `.oauth-config-hermes.json`

## Example of Usage

```javascript
const oauth = require('basic-oauth2');

// Without supplied project name (default)
async function accessTokenWithoutProjectName() {
    const token = await oauth.oauthToken();
    
    // ...
}

// With supplied project name
async function accessTokenWithProjectName() {
    const token = await oauth.oauthToken('hermes');
    
    // ...
}

// HTTP call without project name (default)
async function call() {
    try {
        // http is an axios instance
        const http = await bo.http();

        const response = await http.get('https://api.ahdc.dev/api/test');

        // ...
    } catch(error) {
        console.error(error.request);
    }
}

// HTTP call with project name
async function call() {
    try {
        // http is an axios instance
        const http = await bo.http('hermes');

        const response = await http.get('https://api.ahdc.dev/api/test');

        // ...
    } catch(error) {
        console.error(error.request);
    }
}
```

## .gitignore

It's highly suggested to add the following entries into your .gitignore file

```
.oauth-config*.json
.oauth-token*.json
```

## Tests

*One day...*

## Author

[Aaron Heath](https://aaronheath.com)

## License

MIT