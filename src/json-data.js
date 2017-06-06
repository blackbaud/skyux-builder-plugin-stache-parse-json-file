const fs = require('fs');
const path = require('path');
const root = path.resolve(process.cwd(), 'src', 'stache', 'data');
const cheerio = require('cheerio');

// Adds template reference variable to stache tag:
// <stache #stache></stache>
function addTemplateReferenceVariable(content) {
  let $ = cheerio.load(content, {
    lowerCaseTags: false,
    lowerCaseAttributeNames: false,
    decodeEntities: false
  });

  let stacheTags = $('stache');

  if (stacheTags.length) {
    stacheTags.each(function () {
      $(this)
        .attr('#stache', '');
    });

    content = $.html().toString();
  }

  return content;
}

const preload = (content, resourcePath) => {
  if (resourcePath.match(/\.html$/)) {
    return addTemplateReferenceVariable(content);
  }

  if (!resourcePath.match(/shared\/json-data\.service\.ts$/)) {
    return content;
  }

  let files = fs.readdirSync(root);

  if (files.length > 0) {

    let dataObject = files.reduce((acc, file) => {
      let fileContent = fs.readFileSync(path.join(root, file), 'utf8');
      let fileName = file.split('.')[0].toLowerCase()
        .replace(/\s+/g, '-')        // Replace spaces with -
        .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
        .replace(/\-\-+/g, '-')      // Replace multiple - with single -
        .replace(/^-+/, '')          // Trim - from start of text
        .replace(/-+$/, '');         // Trim - from end of text;
      acc[fileName] = JSON.parse(fileContent);
      return acc;
    }, {});

    content = content.replace(`'noop'`, JSON.stringify(dataObject));
  }

  return content;
};

module.exports = { preload };