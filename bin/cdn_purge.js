var BC = require(__dirname + '/../lib/bc')
    ,Content = BC.require('bc/content').Content
    ,https = require('https')
    ,fs = require('fs');


var mode = process.argv[2];

var raw = fs.readFileSync(process.env.HOME+"/.bc_keycdn.json");
if (!raw) {
    console.log("Error: couldn't find ~/.bc_keycdn.json");
    process.exit(126);
}
var cfg = JSON.parse(raw);
if (!cfg.api_key || !cfg.zone_id) {
    console.log("Error: invalid format in ~/.bc_keycdn.json, need api_key and zone_id");
    process.exit(125);
}

function call(method, path, params) {
    var data = JSON.stringify(params);
    var headers = {};
    if (params) {
        headers['Content-Type'] = 'application/json';
        headers['Content-Length'] = data.length;
    }
    var r = https.request({
        host: 'api.keycdn.com',
        path: path,
        method: method,
        auth: cfg.api_key+':',
        headers: headers
    }, function(res) {
        var body = '';
        res.on('data', function(data) {
            body += data;
        })
        res.on('end', function() {
            var resp = JSON.parse(body);
            if (resp.status === "success") {
                console.log("    ... Done OK");
            } else {
                console.log("    ... FAIL: ", resp);
                process.exit(124);
            }
        })
    });

    r.on('error', function(e) {
        console.log("    ... FAIL: ", e.message);
        process.exit(124);
    })

    if (params) {
        r.write(data);
    }
    console.log("Sending ", method, path, params);
    r.end();
}

switch (mode) {
    case 'all':
        call('GET', '/zones/purge/'+cfg.zone_id+'.json');
        break;
    case 'last':
        console.log("TODO: implement me");
        break;
    default:
        console.log("Unkown mode", mode, ": specify 'all' or 'last' as subcommand");
        process.exit(127);
}
