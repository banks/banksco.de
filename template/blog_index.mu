{{#pages '/p/?type=date&limit=5'}}
    <article>
        {{> blog_post_body.mu }}
        <div class="comments">
        	<a class="comment_link" href="{{ url }}#disqus_thread">&nbsp;</a>
        </div>
    </article>
{{/pages}}

<footer class="page_footer">
    {{> about.mu }}
    {{> nav.mu }}
</footer>