


# SEO Technical Integration Guide

> **Note:** This guide is intended for customers utilizing the player through iframe embeds. 
> If you are using dynamic embeds, there is no action required apart from activating the plugin in the studio.


Due to browser security policies, the player is constrained from directly manipulating or accessing elements in the parent frame. Its capability is limited to communication and data transmission to the parent frame. Therefore, a minor additional code implementation is necessary on your end to facilitate the integration of prepared structured data. This data should be injected into a script tag, as illustrated in the example below.

To enable the SEO plugin, follow these two essential steps:

1. Activate the SEO plugin within the studio. (and supply the required configuration if you select extra data mode)
2. Implement an injection within the parent frame.



## Customer Code Integration

```html
<script>
    window.addEventListener('message', (event) => {
        if (event.data.type === 'SEOStructuredData') {
            const { SEOStructuredData } = event.data;
            const script = document.createElement('script');
            script.setAttribute('type', 'application/ld+json');
            script.textContent = JSON.stringify(SEOStructuredData);
            document.head.appendChild(script);
        }
    });
</script>
```
all you need to do , is copy this code snipt inot your `<head>` tag element.

By completing these steps, you'll ensure the proper integration and functioning of the SEO plugin and its benefits for your embedded content.
