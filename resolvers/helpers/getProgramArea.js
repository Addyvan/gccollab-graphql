function getLocation(LOCATION_ENUM) {
  var output = "";
    
  switch(LOCATION_ENUM) {
    case "ADMINISTRATION": output = "administration"; break;
    case "CLIENT_SERVICE": output = "information_technology"; break;
    case "LEGAL_AND_OR_REGULATORY": output = "legal_regulatory"; break;
    case "SECURITY_AND_OR_ENFORCEMENT": output = "security_enforcement"; break;
    case "HUMAN_RESOURCES": output = "human_resources"; break;
    case "POLICY": output = "policy"; break;
    case "COMMUNICATIONS": output = "communications"; break;
    case "SCIENCE": output = "science"; break;
    case "INFORMATION_TECHNOLOGY": output = "information_technology"; break;
    case "OTHER": output = "other"; break;
    case "ALL": output= "all"; break;
    default: console.log("Invalid Department Selection"); break;
  }

  return (output);
}

module.exports = getLocation;