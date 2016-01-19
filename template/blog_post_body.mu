<header>
    <h1><a href="{{ url }}">{{ title }}</a></h1>
    <div class="post_meta">
        <time pubdate="pubdate">
            {{date_format pub_date "Do MMMM YYYY"}}
        </time>
    </div>
</header>

{{{ content }}}