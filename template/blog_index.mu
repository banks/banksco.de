{{#pages '/p/?type=date&limit=5'}}
    <article>
        {{> blog_post_body.mu }}
    </article>
{{/pages}}

<footer class="page_footer">
    {{> about.mu }}
    {{> nav.mu }}
</footer>