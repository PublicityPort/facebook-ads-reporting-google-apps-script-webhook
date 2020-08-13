function doGet(e){
const accountId=String(e.parameter.accountId);
const spreadSheetUrl=String(e.parameter.spreadSheetUrl);
const sheetName=String(e.parameter.sheetName);
const authKey=String(e.parameter.authKey);
if (sheetName){
requestGetFacebookReport(accountId,spreadSheetUrl,sheetName,authKey);
return ContentService.createTextOutput('OK');
}
}

// DO NOT MODIFY ANYTHING BELOW //

function requestGetFacebookReport(accountId, spreadSheetUrl, sheetName,authKey){
        
      // ad account ID
  var AD_ACCOUNT_ID = accountId;
  
  // ad, adset, campaign, account
  const LEVEL = 'account'
  
  // https://developers.facebook.com/docs/marketing-api/insights/parameters#fields
  const FIELDS = 'account_currency,account_id,account_name,actions,ad_name,adset_id,adset_name,canvas_avg_view_time,catalog_segment_value,ad_id,conversion_values,conversions,converted_product_quantity,converted_product_value,cost_per_action_type,cost_per_conversion,cost_per_thruplay,campaign_name,impressions,unique_clicks,clicks,spend,reach,cpc,cpm,cpp,ctr,date_start,date_stop,frequency,objective,purchase_roas,video_p75_watched_actions,video_p100_watched_actions,video_p50_watched_actions,video_p95_watched_actions,social_spend,website_purchase_roas,website_ctr'
  
  // https://developers.facebook.com/docs/marketing-api/insights/parameters#param
  const DATE_RANGE = 'lifetime'
  
  // user access token linked to a Facebook app
  var TOKEN=authKey;
  // number of days from 1 to 90
  const TIME_INCREMENT = '1'
  
  // https://developers.facebook.com/docs/marketing-api/insights/parameters#param
  const FILTERING = Array()
  
  // url of the google sheets where the report will be
  var SPREADSHEET_URL =spreadSheetUrl;

  // name of the sheet where the report will be
  var TAB_NAME =sheetName;  
  
  // Builds the Facebook Ads Insights API URL
  const facebookUrl = `https://graph.facebook.com/v7.0/act_${AD_ACCOUNT_ID}/insights?level=${LEVEL}&fields=${FIELDS}&date_preset=${DATE_RANGE}&access_token=${TOKEN}&time_increment=${TIME_INCREMENT}&filtering=${FILTERING}&limit=1000`;
                       
                       
  const encodedFacebookUrl = encodeURI(facebookUrl);
  
  const options = {
    'method' : 'post',
      };
  
  // Fetches & parses the URL 
  const fetchRequest = UrlFetchApp.fetch(encodedFacebookUrl, options);
  const results = JSON.parse(fetchRequest.getContentText());
  
  // Caches the report run ID
  const reportId = results.report_run_id;
  const cache = CacheService.getScriptCache();
  const cached = cache.get('campaign-report-id');
   if (cached != null) {
    cache.put('campaign-report-id', [], 1);
    Utilities.sleep(5000);
    cache.put('campaign-report-id', reportId, 21600);
  } else {
    cache.put('campaign-report-id', reportId, 21600); 
  };
  
  const ss = SpreadsheetApp.openByUrl(SPREADSHEET_URL);
  const sheet = ss.getSheetByName(TAB_NAME);
  
   // Clears the sheet
  sheet.clear();
    
  const url = `https://www.facebook.com/ads/ads_insights/export_report?report_run_id=${cached}&format=csv&access_token=${TOKEN}&locale=en_US`;
  Logger.log(url);
  const fetchRequest1 = UrlFetchApp.fetch(url);
  
  Logger.log(fetchRequest1);
    
  const results1 = Utilities.parseCsv(fetchRequest1);
  
  // Pastes the csv file in the sheet
  sheet.getRange(1,1, results1.length, results1[0].length).setValues(results1);
  
  
}
