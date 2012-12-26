<h1>Post Archive</h1>
<p>All posts on this blog by date</p>

{{#pages '/p/?type=date'}}
    {{#if_different 'pub_date.year' loop_ctx=@loop}}
        <h2>{{date_format pub_date "YYYY"}}</h2>
        <ul>
    {{/if_different}}


        {{#if_different 'pub_date.month' loop_ctx=@loop}}
            <span class="month">{{date_format pub_date "MMMM"}}</span>
        {{/if_different}}

        <li>
            <span>{{date_format pub_date "Do"}}</span> 
            <a href="{{ url }}">{{ title }}</a>
        </li>

    {{#if_different 'pub_date.year' loop_ctx=@loop}}
        </ul>
    {{/if_different}}
{{/pages}}

<footer class="page_footer">
    {{> about.mu }}
    {{> nav.mu }}
</footer>