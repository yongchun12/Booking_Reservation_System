const { SESClient, ListIdentitiesCommand } = require('@aws-sdk/client-ses');
const { NodeHttpHandler } = require("@smithy/node-http-handler");
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '.env.production') });
dotenv.config({ path: path.resolve(__dirname, '.env') });

const ses = new SESClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        sessionToken: process.env.AWS_SESSION_TOKEN
    },
    requestHandler: new NodeHttpHandler({
        connectionTimeout: 3000,
        socketTimeout: 3000,
    }),
});

async function checkIdentities() {
    console.log('Checking for existing AWS SES Identities...');
    try {
        const command = new ListIdentitiesCommand({ IdentityType: 'EmailAddress' });
        const response = await ses.send(command);
        console.log('---------------------------------------------------');
        console.log('Existing Identities:', response.Identities);
        console.log('---------------------------------------------------');

        if (response.Identities.length > 0) {
            console.log("✅ GOOD NEWS: You HAVE identities created!");
            console.log("You can use any of these emails.");
        } else {
            console.log("❌ No identities found.");
        }
    } catch (error) {
        console.error('❌ ERROR: Could not list identities.');
        console.error(error.message);
    }
}

checkIdentities();
