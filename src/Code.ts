// https://core.telegram.org/bots/api

/*
var token = PropertiesService.getScriptProperties().getProperty('TELEGRAM_TOKEN');
var telegramURL = "https://api.telegram.org/bot"+ token;
var webAppURL = PropertiesService.getScriptProperties().getProperty('WEB_APP_URL');

var spreadsheetID = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
var errorSheet = 0
var usersSheet = 1
var yongjing_id = PropertiesService.getScriptProperties().getProperty('TELEGRAM_OWNER_ID');

function getMe() {
  var URL = telegramURL + "/getMe";
  var response = UrlFetchApp.fetch(URL);
  Logger.log(response.getContentText());
}

function setWebhook(){
  var URL = telegramURL + "/setWebhook?url=" + webAppURL;
  var response = UrlFetchApp.fetch(URL);
  Logger.log(response.getContentText());
}

function sendText(id, text){
  var encodedText = encodeURIComponent(text) //encodes the text so that escape characters send properly as a message (e.g. allows the use of \n)
  var URL = telegramURL + "/sendMessage?chat_id=" + id + "&text=" + encodedText + "&parsemode=" + "Markdown";
  var response = UrlFetchApp.fetch(URL);
  Logger.log(response.getContentText());
}


//function doGet(e){
//  return HtmlService.createHtmlOutput("Hello")
//}

function doPost(e) {
  try{
    var data = JSON.parse(e.postData.contents);
    var text = data.message.text;
    var id = data.message.chat.id;
    var name = ""
    if (data.message.chat.first_name != null) {
    name = name + data.message.chat.first_name
    }
    if (data.message.chat.last_name != null){
    + " " + data.message.chat.last_name;
    }
    
    //Put_Spreadsheet(usersSheet, [id, name, text, new Date()]);
    //sendText(id, "result: " + Get_Spreadsheet_Row(usersSheet, id, "A", "D"));
    //Set_Spreadsheet_Row(usersSheet, name, "B", [id,"testttt","sdsdfsdg","more trset","dsgsdg"])
    
    if (text == "/start") {
      sendText(id, "Hello! This is Yeng Jeng Bot!")
    }

    else if (text === "/version") {
      sendText(id, "Yeng Jeng Bot\nVersion " + APP_VERSION);
    }
    
    else if(text.split(" ")[0].toUpperCase() == "BUS"){
      sendText(id, "Gimme a sec, getting the bus timings");
      if(text.split(" ").length == 1){
        let bus_stop_no = String(Get_Spreadsheet_Row(usersSheet, id, "A", "D"));
        if (bus_stop_no != null){
          var reply = Get_Bus_Timing(bus_stop_no.split(",")[2].split(" ")[1]);
          sendText(id, reply);
        }
        else{
          var reply = Get_Bus_Timing("04167");
          sendText(id, reply);
        }
      }
      else if(text.split(" ").length == 2){
        var prev_bus = Get_Spreadsheet_Row(usersSheet, id, "A", "D");
        let bus_no = text.split(" ")[1]
        var reply = Get_Bus_Timing(bus_no)
        sendText(id, reply);
        if (prev_bus == null){
          Put_Spreadsheet(usersSheet, [id, name, text, new Date()])
        }
        else{
          Set_Spreadsheet_Row(usersSheet, id, "A", [id, name, text, new Date()])
        }
      }
      else{
        sendText(id, "That's not a valid bus number! Please use " + '"BUS [BUS NUMBER]"' + " if you would like me to find the bus arrival timing! For example, type BUS 12345")
      }
    }
    
    else if(text.split(" ")[0].toUpperCase() == "HELP"){
      sendText(id, "----- HELP -----\n" +
               "BUS [BUS NUMBER]: Gets the bus stop timings for the bus stop with bus stop number. For example, type BUS 12345\n" +
               "BUS : Type BUS without a bus stop number to get the timings for the previously requested bus stop.");
    }
    else{
      sendText(id, "Sorryy, I don't understand what you just said :(\nPlease type HELP for more information");
    }
  }
  catch(e){
    Put_Spreadsheet(errorSheet,[new Date(), e]);
  }
}

function Put_Spreadsheet(sheet_num, data_array){
  //appends data_array into spreadsheet number sheet_num
  SpreadsheetApp.openById(spreadsheetID).getSheets()[sheet_num].appendRow(data_array);
}

function Get_Spreadsheet_Row(sheet_num, selected_key, search_column, end_column){
  //returns an csv containing items from search_column to end_column where the item in search_column is the selected_key
  for(var i = 1; i < 300; i++) {
    key = SpreadsheetApp.openById(spreadsheetID).getSheets()[sheet_num].getRange(search_column + String(i)).getValue();
    if(String(key) === String(selected_key)){
      return SpreadsheetApp.openById(spreadsheetID).getSheets()[sheet_num].getRange(search_column + String(i) + ":" + end_column+ String(i)).getValues()[0];
    }
  }
  return null;
}

function Set_Spreadsheet_Row(sheet_num, selected_key, search_column, data_array){
  //finds the selected_key in the search_column of sheet number sheet_num, and changes the cell of the selected_key and subsequent cells to be the same as data_array
  let col_num = search_column.charCodeAt(0) - "A".charCodeAt(0) + 1;
  for(var i = 1; i < 300; i++) {
    key = SpreadsheetApp.openById(spreadsheetID).getSheets()[sheet_num].getRange(search_column + String(i)).getValue();
    if(key == selected_key){
      for(var j = 0; j < data_array.length; j++){
        SpreadsheetApp.openById(spreadsheetID).getSheets()[sheet_num].getRange(i, col_num+j).setValue(data_array[j]);
      }
      return;
    }
  }
}

function Get_Substring(string_, start_, end_){
  if (string_.indexOf(start_) != -1){
  slice1 = string_.substring(string_.indexOf(start_) + start_.length, string_.length);
  //Logger.log( "Slice 1 " + slice1);
  }
  else{
   Logger.log( start_ + " (start)not found in " + string_);
   return("")
  }
  if (slice1.indexOf(end_) != -1){
    slice2 = slice1.substring(0, slice1.indexOf(end_));
    return slice2;
  }
  else{
   Logger.log( end_ + " (end) not found in " + slice1);
   return("")
  }
  return ("Not found!")
}

function Get_Bus_Timing(busStopNo = "01113"){
  try{
    var response = UrlFetchApp.fetch("https://www.sbstransit.com.sg/service/sbs-transit-app?BusStopNo=" + busStopNo + "&ServiceNo=")
    var contentText = response.getContentText();
    var table = "";
    var tbody = "";
    var buses = new Array();
    buses.push("no buses")
    
    var ret = "Bus Stop " + busStopNo + " not found! :("
    
    //get the table and table body
    table = Get_Substring(contentText,'<table class="table tb-bus tbres tbbreak-app">',"</table>");
    tbody = Get_Substring(table,'<tbody>',"</tbody>");
    //Logger.log(tbody);
    
    //get buses
    var bus = Get_Substring(tbody,'<tr>',"</tr>");
    if(bus != ""){
     buses.shift(); //remove "no buses"
    }
    while (bus != ""){
      buses.push(bus);
      bus = Get_Substring(tbody,'<tr>',"</tr>");
      tbody = tbody.slice(bus.length);
      //Logger.log(bus);
    }
    
    if (buses.length > 0 & buses[0] != "no buses"){
      ret = "----- BUS STOP " + busStopNo + " -----"
      var busNo = "0"
      var newbusNo = "0"
      for (var i = 0; i < buses.length; i++){
        newbusNo = Get_Substring(buses[i],'<td width="52%" class="text-left">',"</td>").split(" ")[0];
        if (newbusNo != busNo){
          busNo = newbusNo
          //Logger.log(busNo);
          var busColour1 = Get_Substring(buses[i],'<td width="24%" class="text-left"><span class="','">');
          //Logger.log(busColour1);
          var nextArrival = Get_Substring(buses[i],'<td width="24%" class="text-left"><span class="'+ busColour1 +'">', '</span>');
          
          //Logger.log(nextArrival);
          secondHalf = buses[i].slice(buses[i].length / 2)
          
          var busColour2 = Get_Substring(secondHalf,'<td width="24%" class="text-left"><span class="','">');
          //Logger.log(busColour2);
          var subsequentArrival = Get_Substring(secondHalf,'<td width="24%" class="text-left"><span class="'+ busColour2 +'">', '</span>');
          //Logger.log(subsequentArrival);
          ret = ret + "\nBus " + busNo + ": " + nextArrival +", "+ subsequentArrival
        }
      }
    }
    return ret
  }
  catch(e){
    SpreadsheetApp.openById(spreadsheetID).getSheets()[0].appendRow([new Date(), "Function Get_Bus_Timing", e])
  }
}*/
