# UrlShortener
URL Shortener is used to create short URLs that can be easily shared, tweeted, or emailed to friends whcic is built using Google Cloud functions, Cloud hosting and firestore

# API endpoints

## */data*

Endpont returns all short links added by particular user

> example url

> **/data?uid=[USER_ID]**

```json
[
    {
        code: "code1",
        views: 0,
        url:, "url1",
        uid: "USER_ID"
    },
    {
        code: "code2",
        views: 0,
        url:, "url2",
        uid: "USER_ID"
    }
]
```

## */add*

Endpont returns all short links added by particular user

> example url

> **/data?uid=[USER_ID]&auto=[true|false]&code=[UNIQUE_CODE]&url=[URL]**

Query | Description
------------ | -------------
uid | unique user id
code | unique short link code (Optional)
url | link to short
auto | to generate unique code automatically [true|false] (Optional)


```json
{
    error: "[true/false]",
    msg: "[Success / Failure]"
}
```

## Demo UI for this Project

> [PonnamKarthik/Url-Shortener-UI](https://github.com/PonnamKarthik/Url-Shortener-UI)