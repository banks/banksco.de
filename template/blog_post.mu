<article>
    {{> blog_post_body.mu }}
    <footer>
        <div class="comments">
            <a class="comment_link" href="#disqus_thread"></a>
            <div id="disqus_thread"></div>
        </div>
        {{> about.mu }}
        <div class="arrows">
            {{#prev_page}}
                <a class="prev" href="{{ url }}"><span>&laquo;</span> {{ title }}</a>
            {{^}}
                <div class="prev_spacer"></div>
            {{/prev_page}}
            {{#next_page}}
                <a class="next" href="{{ url }}">{{ title }} <span>&raquo;</span></a>
            {{/next_page}}
            <div class="clear"></div>
        </div>
        {{> nav.mu }}
    </footer>
</article>