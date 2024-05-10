---
title: "Using / for division is deprecated and will be removed in Dart Sass 2.0.0."
categories:
  - Programming
toc: true
toc_label: "Using / for division is deprecated and will be removed in Dart Sass 2.0.0."
toc_icon: "tags"
toc_sticky: true
---
# Overview
Jekyll로 만든 github 블로그를 오랜만에 로컬에서 실행해보니 `Using / for division is deprecated and will be removed in Dart Sass 2.0.0.`라는 Deprecation Warning 메시지가 6개나 생성되어 관련된 내용을 수정한 과정을 기록하였습니다.
# Warning Message
`/`를 사용한 나눗셈은 권장되지 않으며 Dart Sass 2.0.0에서 제거될 예정이기 때문에 `/`로 나눗셈을 하지 말라는 경고 메세지입니다.
```bash
Configuration file: /Users/kgy/Desktop/kgy/Sites/akima9.github.io/_config.yml
To use retry middleware with Faraday v2.0+, install `faraday-retry` gem
            Source: /Users/kgy/Desktop/kgy/Sites/akima9.github.io
       Destination: /Users/kgy/Desktop/kgy/Sites/akima9.github.io/_site
 Incremental build: disabled. Enable with --incremental
      Generating... 
       Jekyll Feed: Generating feed for posts
Deprecation Warning: Using / for division is deprecated and will be removed in Dart Sass 2.0.0.

Recommendation: math.div(9, 16)

More info and automated migrator: https://sass-lang.com/d/slash-div

   ╷
31 │ $mfp-iframe-ratio:                    9/16;                       // Ratio of iframe (9/16 = widescreen, 3/4 = standard, etc.)
   │                                       ^^^^
   ╵
    /Users/kgy/Desktop/kgy/Sites/akima9.github.io/_sass/minimal-mistakes/vendor/magnific-popup/_settings.scss 31:39      @import
    /Users/kgy/Desktop/kgy/Sites/akima9.github.io/_sass/minimal-mistakes/vendor/magnific-popup/_magnific-popup.scss 3:9  @import
    minimal-mistakes.scss 13:9                                                                                           @import
    /Users/kgy/Desktop/kgy/Sites/akima9.github.io/assets/css/main.scss 4:9                                               root stylesheet
Deprecation Warning: Using / for division outside of calc() is deprecated and will be removed in Dart Sass 2.0.0.

Recommendation: math.div($value, 16px) or calc($value / 16px)

More info and automated migrator: https://sass-lang.com/d/slash-div

   ╷
28 │     @return $value / 16px * 1em;
   │             ^^^^^^^^^^^^^
   ╵
    /Users/kgy/Desktop/kgy/Sites/akima9.github.io/_sass/minimal-mistakes/vendor/breakpoint/_helpers.scss 28:13                base-conversion()
    /Users/kgy/Desktop/kgy/Sites/akima9.github.io/_sass/minimal-mistakes/vendor/breakpoint/_helpers.scss 20:13                breakpoint-to-base-em()
    /Users/kgy/Desktop/kgy/Sites/akima9.github.io/_sass/minimal-mistakes/vendor/breakpoint/parsers/single/_default.scss 8:29  breakpoint-parse-default()
    /Users/kgy/Desktop/kgy/Sites/akima9.github.io/_sass/minimal-mistakes/vendor/breakpoint/parsers/_single.scss 22:14         breakpoint-parse-single()
    /Users/kgy/Desktop/kgy/Sites/akima9.github.io/_sass/minimal-mistakes/vendor/breakpoint/_parsers.scss 153:18               breakpoint-parse()
    /Users/kgy/Desktop/kgy/Sites/akima9.github.io/_sass/minimal-mistakes/vendor/breakpoint/_parsers.scss 48:22                breakpoint()
    /Users/kgy/Desktop/kgy/Sites/akima9.github.io/_sass/minimal-mistakes/vendor/breakpoint/_breakpoint.scss 46:16             breakpoint()
    /Users/kgy/Desktop/kgy/Sites/akima9.github.io/_sass/minimal-mistakes/_reset.scss 13:3                                     @import
    minimal-mistakes.scss 18:9                                                                                                @import
    /Users/kgy/Desktop/kgy/Sites/akima9.github.io/assets/css/main.scss 4:9                                                    root stylesheet
Deprecation Warning: Using / for division outside of calc() is deprecated and will be removed in Dart Sass 2.0.0.

Recommendation: math.div(5px, 2) or calc(5px / 2)

More info and automated migrator: https://sass-lang.com/d/slash-div

   ╷
28 │     margin-bottom: (5px / 2);
   │                     ^^^^^^^
   ╵
    /Users/kgy/Desktop/kgy/Sites/akima9.github.io/_sass/minimal-mistakes/_forms.scss 28:21  @import
    minimal-mistakes.scss 20:9                                                              @import
    /Users/kgy/Desktop/kgy/Sites/akima9.github.io/assets/css/main.scss 4:9                  root stylesheet
Deprecation Warning: Using / for division outside of calc() is deprecated and will be removed in Dart Sass 2.0.0.

Recommendation: math.div(($red * 299) + ($green * 587) + ($blue * 114), 1000) or calc((($red * 299) + ($green * 587) + ($blue * 114)) / 1000)

More info and automated migrator: https://sass-lang.com/d/slash-div

   ╷
68 │   $yiq: (($red*299)+($green*587)+($blue*114))/1000;
   │         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
   ╵
    /Users/kgy/Desktop/kgy/Sites/akima9.github.io/_sass/minimal-mistakes/_mixins.scss 68:9   yiq-is-light()
    /Users/kgy/Desktop/kgy/Sites/akima9.github.io/_sass/minimal-mistakes/_mixins.scss 81:14  yiq-contrast-color()
    /Users/kgy/Desktop/kgy/Sites/akima9.github.io/_sass/minimal-mistakes/_mixins.scss 91:10  yiq-contrasted()
    /Users/kgy/Desktop/kgy/Sites/akima9.github.io/_sass/minimal-mistakes/_buttons.scss 46:7  @import
    minimal-mistakes.scss 25:9                                                               @import
    /Users/kgy/Desktop/kgy/Sites/akima9.github.io/assets/css/main.scss 4:9                   root stylesheet
Deprecation Warning: Using / for division outside of calc() is deprecated and will be removed in Dart Sass 2.0.0.

Recommendation: math.div($span-width, $container) or calc($span-width / $container)

More info and automated migrator: https://sass-lang.com/d/slash-div

   ╷
93 │     @return percentage($span-width / $container);
   │                        ^^^^^^^^^^^^^^^^^^^^^^^^
   ╵
    /Users/kgy/Desktop/kgy/Sites/akima9.github.io/_sass/minimal-mistakes/vendor/susy/susy/_su-math.scss 93:24          su-span()
    /Users/kgy/Desktop/kgy/Sites/akima9.github.io/_sass/minimal-mistakes/vendor/susy/susy/_syntax-helpers.scss 190:11  su-call()
    /Users/kgy/Desktop/kgy/Sites/akima9.github.io/_sass/minimal-mistakes/vendor/susy/susy/_api.scss 146:13             susy-span()
    /Users/kgy/Desktop/kgy/Sites/akima9.github.io/_sass/minimal-mistakes/vendor/susy/susy/_unprefix.scss 19:11         span()
    /Users/kgy/Desktop/kgy/Sites/akima9.github.io/_sass/minimal-mistakes/_utilities.scss 185:24                        @content
    /Users/kgy/Desktop/kgy/Sites/akima9.github.io/_sass/minimal-mistakes/vendor/breakpoint/_breakpoint.scss 66:7       breakpoint()
    /Users/kgy/Desktop/kgy/Sites/akima9.github.io/_sass/minimal-mistakes/_utilities.scss 184:3                         @import
    minimal-mistakes.scss 34:9                                                                                         @import
    /Users/kgy/Desktop/kgy/Sites/akima9.github.io/assets/css/main.scss 4:9                                             root stylesheet
Deprecation Warning: Using / for division outside of calc() is deprecated and will be removed in Dart Sass 2.0.0.

Recommendation: math.div($gutters, $container) or calc($gutters / $container)

More info and automated migrator: https://sass-lang.com/d/slash-div

    ╷
144 │   @return percentage($gutters / $container);
    │                      ^^^^^^^^^^^^^^^^^^^^^
    ╵
    /Users/kgy/Desktop/kgy/Sites/akima9.github.io/_sass/minimal-mistakes/vendor/susy/susy/_su-math.scss 144:22         su-gutter()
    /Users/kgy/Desktop/kgy/Sites/akima9.github.io/_sass/minimal-mistakes/vendor/susy/susy/_syntax-helpers.scss 190:11  su-call()
    /Users/kgy/Desktop/kgy/Sites/akima9.github.io/_sass/minimal-mistakes/vendor/susy/susy/_api.scss 205:11             susy-gutter()
    /Users/kgy/Desktop/kgy/Sites/akima9.github.io/_sass/minimal-mistakes/vendor/susy/susy/_unprefix.scss 37:11         gutter()
    /Users/kgy/Desktop/kgy/Sites/akima9.github.io/_sass/minimal-mistakes/_archive.scss 166:20                          @content
    /Users/kgy/Desktop/kgy/Sites/akima9.github.io/_sass/minimal-mistakes/vendor/breakpoint/_breakpoint.scss 66:7       breakpoint()
    /Users/kgy/Desktop/kgy/Sites/akima9.github.io/_sass/minimal-mistakes/_archive.scss 155:3                           @import
    minimal-mistakes.scss 38:9                                                                                         @import
    /Users/kgy/Desktop/kgy/Sites/akima9.github.io/assets/css/main.scss 4:9                                             root stylesheet
                    done in 1.189 seconds.
 Auto-regeneration: enabled for '/Users/kgy/Desktop/kgy/Sites/akima9.github.io'
    Server address: http://127.0.0.1:4000
  Server running... press ctrl-c to stop.
```
# Solution
sass-migrator를 설치하고 실행하면 `/`를 사용한 부분을 `math.div()`또는 `list.slash()`로 변경해줍니다.
```bash
npm install -g sass-migrator
sass-migrator division **/*.scss # 변경하고 싶은 .scss 파일들의 경로를 입력합니다.
```
위 명령어들은 경고 메시지에 나와있는 `More info and automated migrator: https://sass-lang.com/d/slash-div` URL에 접속하면 더 자세하게 확인 할 수 있습니다.