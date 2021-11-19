
# IWO Action List
This is the code for the IWO demo shown at IMPACT.  This is a custom web app built specifically to highlight IWO and AppDynamics working together.  As such, this is meant for demo purposes and the art of the possible. The demo is custom code and not an officially supported product of IWO or Appdynamics. 

When executing an action, it also removes the action but does not execute it since this code is meant for demo purposes.  There is work being done to get this to a full fledged field integration that a customer could use. The idea is a customer could host this custom web app and this would be loaded into the AppDynamics UI via an Iframe. The code is distributed as is.  

Does not currently work in Internet Explorer

## Required Frameworks

1. NodeJS v7 or above

References:

* <https://nodejs.org/en/download/>


## Installing

1. Download the latest release <https://github.com/Appdynamics/CWOM-Action-Integration>
1. Change into the directory: `cd CWOM-Action-Integration`
1. Download npm dependencies: `npm install`
1. Create a config.json file in the root directory with the following :
1. Create two file iwo_private_key.pem and iwo_public_key.txt in the /keys directory. you can get those value from Intersight by creating an API key

```
{
	"localport":3000,
    "https":true,
	"iwo_config": {
		"iwoServer": 		"https://intersight.com",
		"iwoAPIPath": 		"/wo/api/v3",
		"iwoViewEntityURL": "/view/main/"
	},
}
```

If you copy the above default text, you can still run the node.js server. cwom_config is only required if you are connecting to a cwom instance. There is a demo page that can display fake actions if you do not have a cwom instance available. See Documentation section below.

* `localport`: the port that the node.js server will be started on
* `https`: use the https protocol
* `iwoServer`: url to the IWO instance
* `iwoAPIPath`: API path to pull data from IWO
* `iwoViewEntityURL`: path to visualize entities in IWO


6. Start node.js: `npm start`
7. Open browser to:
   http://localhost:3000
   



# Documentation
Example page with real action data: http://localhost:3000/views/examples/cwom.html?businessAppID=put_your_business_appid_here

The easiest way to find the business appid is to open up the IWO instance, click on search, click business applications, click on your business application.  The ID can be found in the URL (you must decode it as it's formatted in base64).  

Example page with fake action data for demo purposes (if you don't have a cwom instance to hook into): http://localhost:3000/views/examples/cwomMockData.html

# AppDynamics Dashboard
If you want to display the custom web app along side a custom dashboard, an iframe component can be used pointed to the webapp.  Make sure that Security Sandbox IFrame is unchecked when adding iframe component. The config file for the dashboard used at impact can be found in the root directory as `business-impact-dashboard.json`.  Just import the file into your dashboard page and update the health rules and iframe to point to the correct location.


