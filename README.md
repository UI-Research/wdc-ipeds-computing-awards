# Tableau Web Data Connector for IPEDS CIP 11 graduation data from Urban Institute's Education Data Portal

This tool allows users to pull IPEDS CIP 11 Awards graduation data from Urban Institute's Education Data Portal into Tableau Desktop. Users can pull data for a single FIPS code and up to three years at a time. For more information on how to run the tool, please see the Wiki.

# Create your own Tableau WDC
[![Tableau Supported](https://img.shields.io/badge/Support%20Level-Tableau%20Supported-53bd92.svg)](https://www.tableau.com/support-levels-it-and-developer-tools) [![Coverage Status](https://coveralls.io/repos/github/tableau/webdataconnector/badge.svg?branch=master)](https://coveralls.io/github/tableau/webdataconnector?branch=master) [![Build Status](https://travis-ci.org/tableau/webdataconnector.svg?branch=master)](https://travis-ci.org/tableau/webdataconnector)

Use the Tableau Web Data Connector (WDC) to connect to web data sources from Tableau. This is the repository for the Tableau WDC SDK, which includes developer samples and a simulator to help you create your connectors.

[Visit the project website and documentation here](https://tableau.github.io/webdataconnector/).

Want to contribute to the WDC? See our [contribution guidelines](http://tableau.github.io/).
#tableau-examples

# how to run locally after cloning repository
1. In the top level directory run `npm install --production`. This should download the node_modules folder to your local repository.
2. Run `npm start`. This should start the test web server.
3. Open a browser and navigate to the following URL: `http://localhost:8888/Simulator/index.html`
#### Note: If you have issues with running the npm commands, you might want to try deleting the existing `package.json` and `package-lock.json` files and downloading and replacing them from https://github.com/tableau/webdataconnector/. Then try these steps again.

### The default branch was renamed from main to staging. In order to rename in your local environment, run:
- `git branch -m main staging`
- `git fetch origin`
- `git branch -u origin/staging staging`
- `git remote set-head origin -a`
