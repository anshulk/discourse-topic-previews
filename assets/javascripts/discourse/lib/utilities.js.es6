import { iconHTML } from "discourse-common/lib/icon-library";

var isThumbnail = function(path) {
  return typeof path === 'string' &&
         path !== 'false' &&
         path !== 'nil' &&
         path !== 'null' &&
         path !== '';
};

var previewUrl = function(thumbnails) {
  if (thumbnails) {
    if (thumbnails.retina && isThumbnail(thumbnails.retina)) {
      return window.devicePixelRatio >= 2 ? thumbnails.retina : thumbnails.normal;
    } else if (thumbnails.normal && isThumbnail(thumbnails.normal)) {
      return thumbnails.normal;
    } else if (isThumbnail(thumbnails)) {
      return thumbnails;
    }
  } else {
    return false;
  }
};

var renderUnboundPreview = function(thumbnails, params) {
  const url = previewUrl(thumbnails);

  if (!url) return '';

  if (Discourse.Site.currentProp('mobileView')) {
    return `<img class="thumbnail" src="${url}"/>`;
  };

  const settings = Discourse.SiteSettings;
  const attrPrefix = params.isSocial ? 'max-' : '';
  const attrWidthSuffix = params.tilesStyle ? '%' : 'px';
  const attrHeightSuffix = params.tilesStyle ? '' : 'px';
  const category_width = params.category ? params.category.topic_list_thumbnail_width : false;
  const category_height = params.category ? params.category.topic_list_thumbnail_height : false;
  const featured_width = params.featured ? settings.topic_list_featured_width : false;
  const featured_height = params.featured ? settings.topic_list_featured_height : false;
  const tiles_width = params.tilesStyle ? '100' : false;
  const tiles_height = params.tilesStyle ? 'auto' : false;
  const height = tiles_height || featured_height || category_height || settings.topic_list_thumbnail_height;
  const width = tiles_width || featured_width || category_width || settings.topic_list_thumbnail_width;
  const style = `${attrPrefix}height:${height}${attrHeightSuffix};${attrPrefix}width:${width}${attrWidthSuffix}`;

  return `<img class="thumbnail" src="${url}" style="${style}" />`;
};

var testImageUrl = function(thumbnails, callback) {
  const url = previewUrl(thumbnails);
  let timeout = Discourse.SiteSettings.topic_list_test_image_url_timeout;
  let timer, img = new Image();
  img.onerror = img.onabort = function () {
    clearTimeout(timer);
    callback(false);
  };
  img.onload = function () {
    clearTimeout(timer);
    callback(true);
  };
  timer = setTimeout(function () {
    callback(false);
  }, timeout);
  img.src = url;
};

let getDefaultThumbnail = function(category) {
  let catThumb = category ? category.topic_list_default_thumbnail : false;
  let defaultThumbnail = catThumb || Discourse.SiteSettings.topic_list_default_thumbnail;
  return defaultThumbnail ? defaultThumbnail : false;
}

var buttonHTML = function(action) {
  action = action || {};

  var html = "<button class='list-button " + action.class + "'";
  if (action.title) { html += 'title="' + I18n.t(action.title) + '"'; }
  if (action.disabled) {html += ' disabled';}
  html += `>${iconHTML(action.icon)}`;
  html += "</button>";
  return html;
};

var animateHeart = function($elem, start, end, complete) {
  if (Ember.testing) { return Ember.run(this, complete); }

  $elem.stop()
       .css('textIndent', start)
       .animate({ textIndent: end }, {
          complete,
          step(now) {
            $(this).css('transform','scale('+now+')');
          },
          duration: 150
        }, 'linear');
};

const featuredImagesEnabled = function(category = null, isTopic = false) {
  if (isTopic && !Discourse.SiteSettings.topic_list_featured_images_topic) {
    return false;
  }
  if (!category || Discourse.SiteSettings.topic_list_featured_images_category) {
    return Discourse.SiteSettings.topic_list_featured_images;
  } else {
    return category.topic_list_featured_images;
  }
};

export { renderUnboundPreview, testImageUrl, buttonHTML, animateHeart, featuredImagesEnabled, getDefaultThumbnail };
