import { src, dest } from "gulp";
import webp from "gulp-webp";
import imagemin from 'gulp-imagemin';

export function images() {
    return src('./images/teachers/*.jpg', {encoding: false})
      .pipe(webp())
      .pipe(imagemin({verbose: true}))
      .pipe(dest('./images/teachers-webp'));
}