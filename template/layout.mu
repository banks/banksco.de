<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ layout_title }}</title>
    <link href='http://fonts.googleapis.com/css?family=Buenard:400,700|Signika:300' rel='stylesheet' type='text/css'>
    <link rel="stylesheet" type="text/css" href="{{Cfg.site.base_url}}/css/main.css">
    <link rel="alternate" type="application/rss+xml" title="RSS" href="{{Cfg.site.base_url}}/blog.rss.xml" />
    <!--[if lt IE 9]>
        <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]-->
    <script type="text/javascript">var switchTo5x=true;</script>
    <script type="text/javascript" src="http://w.sharethis.com/button/buttons.js"></script>
    <script type="text/javascript">
        stLight.options({publisher: "ur-948864ed-be85-f6eb-b43f-bf42c5d16084"
                        ,onhover: false
                        ,displayText: false
                        });
    </script>
    {{#if custom_css}}
    <style type="text/css">
        {{#custom_css.title_color}}
        article h1 a, article h1 a:link, article h1 a:active, 
        article h1 a:visited, article h1 a:hover { color: {{this}}; }
        {{/custom_css.title_color}}
        {{#custom_css.link_color}}
        article a, article a:link, article a:active, 
        article a:visited, article a:hover { color: {{this}}; }
        {{/custom_css.link_color}}
        {{custom_css.css}}
    </style>
    {{/if}}
</head>
<body>
    <div id="logo">
        <a href="/"><span>by</span></a>
        <div id="about">
            <h2><a href="/">Paul Banks</a></h2>
            <a class="close">×</a>
        </div>
    </div>
    <div id="content" {{#if layout_content_class}}class="{{layout_content_class}}"{{/if}}>
        {{{ layout_content }}}
    </div>
    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
    <script src="{{Cfg.site.base_url}}/js/main.js"></script>
</body> 
</html>