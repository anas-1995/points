'use strict';
const path = require('path');
const configPath = process.env.NODE_ENV === undefined ?
  '../../server/config.json' :
  `../../server/config.${process.env.NODE_ENV}.json`;
const config = require(configPath);
var ffmpeg = require('fluent-ffmpeg');

module.exports = function (Uploadfile) {

  
  Uploadfile.afterRemote('upload', function (context, result, next) {
    let files = [];
    var folderName = context.req.params.container;
    let src = path.join(__dirname, '../../../MGMTImage/uploadFiles/');
    var urlFileRoot = config.domain + config.restApiRoot + Uploadfile.http.path;
    var urlFileRootSave = urlFileRoot + '/' + folderName + '/download/'
    var urlThumbRootSave = urlFileRoot + '/' + "thumbnail" + '/download/'
    var urlWebThumbRootSave = urlFileRoot + '/' + "web-thumbnail" + '/download/'

    if (process.env.NODE_ENV != undefined) {
      ffmpeg.setFfmpegPath(path.join(config.thumbUrl + config.programFFmpegName[0]));
      ffmpeg.setFfprobePath(path.join(config.thumbUrl + config.programFFmpegName[1]));
    }
    result.result.files.file.forEach((file) => {
      files.push({
        'url': urlFileRootSave + file.name,
        'type': folderName,
        'thumb': "", //urlThumbRootSave + file.name.substring(0, file.name.lastIndexOf('.')) + "_thumb." + extension,
        'webThumbUrl': "" //urlWebThumbRootSave + file.name.substring(0, file.name.lastIndexOf('.')) + "_thumb." + extension
      });
    })
    Uploadfile.app.models.media.create(files, function (err, data) {
      if (err)
        return next(err)
      context.res.json(data);

    })
  })
};
