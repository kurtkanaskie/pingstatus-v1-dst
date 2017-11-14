/* globals context */
/* globals print */
/* Check to see if client.cn is in list of client.cns from the KVM */
/* Could also uses API Product to hold list of client.cns */

var cnsList = context.getVariable("private.flow.client.cns");
var cn = context.getVariable("client.cn");
var cns = cnsList.split(",");
print( "cns: " + cns);
print( "cn: " + cn);

var valid = false;
for(var i = 0; i<cns.length; i++) {
    print( "CN: " + cns[i]);
    if( cns[i] === cn ) {
        valid = true;
    }
}
context.setVariable( "flow.valid.client.cn", valid);
