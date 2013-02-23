var rest = require('../../../services/rest.js');

function upload(req,res){
    rest.end(res,{});
}

module.exports = {
    upload: upload
};