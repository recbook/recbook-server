import fetch from 'node-fetch';

const CONFIG = {
  GOOGLE: {
    API_KEY: process.env.GOOGLE_API_KEY
  }
};

export default class ImageAPIUtil {

  static async encodeBase64(imageUrl) {
    return fetch(imageUrl)
      .then(res => res.buffer())
      .then(image => image.toString('base64'));
  }

  static colorToHex(colorObj) {
    return `#${colorObj.red.toString(16)}${colorObj.green.toString(16)}${colorObj.blue.toString(16)}`;
  }
  /*
  @Return JSON
  {
    red: String,    // 0 ~ 255
    green: String,  // 0 ~ 255
    blue: String    // 0 ~ 255
  }
  */
  static getColorFromImage(imageUrl) {

    const address = `https://vision.googleapis.com/v1/images:annotate?key=${CONFIG.GOOGLE.API_KEY}`;

    const body = {
      requests: [{
        image: {
          content: ''
        },
        features: [
          {
            type: 'IMAGE_PROPERTIES',
            maxResults: 10
          }
        ]
      }]
    };

    return ImageAPIUtil.encodeBase64(imageUrl)
      .then(base64image => {
        body.requests[0].image.content = base64image;
        return fetch(address, {
          method: 'POST',
          headers: {
            'content-type': 'application/json'
          },
          body: JSON.stringify(body)
        })
        .then(res => {
          if (!res.ok) {
            throw Error('No result');
          }
          return res.json();
        })
        .then(obj => obj.responses[0].imagePropertiesAnnotation.dominantColors.colors[0].color)
        .catch((err) => {
          return {
            red: 0,
            green: 0,
            blue: 0
          };
        })
        .then(ImageAPIUtil.colorToHex);
      });
  }

  /*
  @Return JSON
  {
    desc: String // text in the image
  }
  */
  static getTextFromImage(imageUrl) {

    const address = `https://vision.googleapis.com/v1/images:annotate?key=${CONFIG.GOOGLE.API_KEY}`;

    const body = {
      requests: [{
        image: {
          content: ''
        },
        features: [
          {
            type: 'TEXT_DETECTION',
            maxResults: 10
          }
        ]
      }]
    };

    return ImageAPIUtil.encodeBase64(imageUrl)
      .then(data => {
        body.requests[0].image.content = data;
        return fetch(address, {
          method: 'POST',
          headers: {
            'content-type': 'application/json'
          },
          body: JSON.stringify(body)
        })
          .then(res => {
            if (!res.ok) {
              throw Error('No result');
            }
            return res.json();
          })
          .then((obj) => {
            return { desc: obj.responses[0].textAnnotations[0].description };
          })
          .catch(() => {
            return {};
          });
      });
  }
}
