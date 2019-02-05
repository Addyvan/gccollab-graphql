function getLocation(LOCATION_ENUM) {
  var output = "";
    
  switch(LOCATION_ENUM) {
    case "BRITISH_COLUMBIA": output = "british_columbia"; break;
    case "ALBERTA": output = "alberta"; break;
    case "SASKATCHEWAN": output = "saskatchewan"; break;
    case "MANITOBA": output = "manitoba"; break;
    case "ONTARIO": output = "ontario"; break;
    case "QUEBEC": output = "quebec"; break;
    case "NATIONAL_CAPITAL_REGION": output = "national_capital_region"; break;
    case "NEW_BRUNSWICK": output = "new_brunswick"; break;
    case "NOVA_SCOTIA": output = "nova_scotia"; break;
    case "ALL": output= "all"; break;
    default: console.log("Invalid Department Selection"); break;
  }

  return (output);
}

module.exports = getLocation;