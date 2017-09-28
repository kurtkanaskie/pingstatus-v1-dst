var apickli = require('apickli');
var config = require('../../test-config.json');

var defaultBasePath = config.pingstatus.basepath;
var defaultDomain = config.pingstatus.domain;

console.log('pingstatus api: [' + config.pingstatus.domain + ', ' + config.pingstatus.basepath + ']');

var getNewApickliInstance = function(basepath, domain) {
	basepath = basepath || defaultBasePath;
	domain = domain || defaultDomain;

	return new apickli.Apickli('https', domain + basepath);
};

exports.getNewApickliInstance = getNewApickliInstance;
