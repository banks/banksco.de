<article>
    {{> blog_post_body.mu }}
    <footer>
        <div class="comments">
            <div id="disqus_thread"></div>
            <script>
                var disqus_config = function () {
                    this.page.url = '{{ url }}';
                };
                (function() {  // DON'T EDIT BELOW THIS LINE
                    var d = document, s = d.createElement('script');

                    s.src = '//bypaulbanks.disqus.com/embed.js';

                    s.setAttribute('data-timestamp', +new Date());
                    (d.head || d.body).appendChild(s);
                })();
            </script>
            <noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript" rel="nofollow">comments powered by Disqus.</a></noscript>
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