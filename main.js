#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const axios = require('axios');

async function getToken(oauth2) {
    try {
        const result = await oauth2.clientCredentials.getToken({scope: ''});
        return oauth2.accessToken.create(result);
    } catch (error) {
        throw error.message;
    }
}

function filename(type, service) {
    if(type === 'token') {
        return `.oauth-token${service ? `-${service}` : ''}.json`;
    }

    return `.oauth-config${service ? `-${service}` : ''}.json`;
}

function storedToken(oauth2, service) {
    const configPath = `${path.dirname(require.main.filename)}/${filename('token', service)}`;

    if(!fs.existsSync(configPath)) {
        return
    }

    const stored = require(configPath);

    return oauth2.accessToken.create(stored);
}

function isActive(accessToken) {
    const window = 600; // 10 min window (TODO make configurable)

    const expires = accessToken.token.expires_at.getTime() / 1000;
    const renewAfter = expires - window;

    const now = (new Date()).getTime() / 1000;

    return now < renewAfter;
}

function storedConfig(service) {
    const configPath = `${path.dirname(require.main.filename)}/${filename('config', service)}`;

    if(!fs.existsSync(configPath)) {
        throw `No configuration file found at ${configPath}.`;
    }

    const json = require(configPath);

    validateConfig(json);

    return json;
}

function validateConfig(json) {
    if(!json.client) {
        throw 'No client object in configuration.';
    }

    if(!json.client.id) {
        throw 'No client id provided in configuration.';
    }

    if(!json.client.secret) {
        throw 'No client secret provided in configuration.'
    }

    if(!json.auth) {
        throw 'No auth object in configuration.';
    }

    if(!json.auth.tokenHost) {
        throw 'No token host provided in configuration.'
    }
}

function setupActions(config) {
    if(config.tls && !config.tls.validate) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    }

    return require('simple-oauth2').create({client: config.client, auth: config.auth});
}

function storeToken(accessToken, service) {
    fs.writeFileSync(
        `${path.dirname(require.main.filename)}/${filename('token', service)}`,
        JSON.stringify(accessToken.token)
    );
}

async function oauthToken(service = '') {
    try {
        let accessToken;

        // Load configuration
        const config = storedConfig(service);

        // Perform setup actions
        const oauth2 = setupActions(config);

        // Check if we have active token stored (.oauth-token.json || .oauth-token-${service}.json), if so return it straight away.
        accessToken = storedToken(oauth2, service);

        if(accessToken && isActive(accessToken)) {
            return accessToken.token;
        }

        // Call service and fetch access token
        accessToken = await getToken(oauth2);

        // Store access token for later use (.oauth-token-${service}.json)
        storeToken(accessToken, service);

        // Return access token
        return accessToken.token;
    } catch(error) {
        console.error(error);
    }
}

async function http(service) {
    const token = await oauthToken(service);

    axios.defaults.headers.common = {
        'Accept': 'application/json',
        'Authorization': `${token.token_type} ${token.access_token}`,
    };

    return axios;
}

module.exports = {http, oauthToken};
