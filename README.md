# Links

1. Production - https://cvi.finance/
2. Silent - https://silent-cvi.surge.sh
3. Staging - https://staging-cvi.surge.sh


# Jira 

https://creditcoin.atlassian.net/jira/software/c/projects/CVIX/boards/56

# How To Develop

1. Create a new branch on top of origin/main
2. Develop
3. Create a PR in Github
4. Your PR version will be deployed to surge.sh. Links will be added as a comment in your PR automatically.
5. Test it and let @Costa test it.
6. Merge your PR by rebasing.
7. Ask for deployment to production (AWS S3).

# Run Project Locally

1. `yarn install`

You need to login to `coti-cvi` private-npm-registry to be able to install some of the dependencies of this project:

```
npm login
username: <your npm username>
password: <your password (not your token)>
email: <your email which is linked to your username>
auth: <check your email for verification code>
```

### To start the web on staging env:

Create `.env` file:

```
REACT_APP_HOST_V2=https://api.dev-cvi-finance-route53.com
GENERATE_SOURCEMAP=true
REACT_APP_ENVIRONMENT=staging
```

and run `yarn start`

### To start the web on mainnet env:

Create `.env.production` file:

```
REACT_APP_HOST_V2=https://api.dev-cvi-finance-route53.com
GENERATE_SOURCEMAP=false
REACT_APP_ENVIRONMENT=mainnet
```

and run `yarn start:production`

# Deploy Project

### Deploy to mainnet silent (only viewed internally by the company):

https://silent-cvi.surge.sh

1. Happends automatically when merging a PR in github.
2. To manually deploy, run: `GITHUB_REF_NAME=main yarn deploy-to-surge`.
* It will also deploy to staging (https://staging-cvi.surge.sh)

### Deploy to mainnet production (viewed by everyone):

1. `AWS_ACCESS_KEY_ID=<id> AWS_SECRET_ACCESS_KEY=<key> yarn deploy-production-to-aws-s3`

### Deploy to staging:

1. Happends automatically when merging a PR in github.
2. To manually deploy, run: `GITHUB_REF_NAME=main yarn deploy-to-surge`.
* It will also deploy to silent (https://silent-cvi.surge.sh)

### Connect to Staging ETH And Polygon Networks With Metamask:

#### Staging Ethereum:
* RPC URL https://staging-ethereum.cvi.finance
* Chain ID 31337

#### Staging Polygon:
* RPC URL https://staging-polygon.cvi.finance
* Chain ID 31338
