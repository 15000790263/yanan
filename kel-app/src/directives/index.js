import ClickOutsideDirective from './click-outside';
import SliderDirective from './slider';
import Pinchzoom from './pinchzoom';
import Intersect from './intersect';
import longPress from './long-press/index';

export function registerDirectives(app) {
  app.directive('click-outside', ClickOutsideDirective);
  app.directive('slider', SliderDirective);
  app.directive('pinchzoom', Pinchzoom);
  app.directive('intersect', Intersect);
  app.directive('long-press', longPress)
}
