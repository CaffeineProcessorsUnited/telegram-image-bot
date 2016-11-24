# telegram-image-bot

## Installing

### Clone/Download this repo

Either download this repository as tarball/zip or clone it with git.


### Install dependencies

```bash
npm install
```


### Create a configuration file

```bash
cp config.sample.json config.json
```

Adjust the configuration inside `config.json` to match your needs.


## Configuration

* [Telegram](#configuration_telegram)
* [Bing](#configuration_bing)
* [Bot](#configuration_bot)

<a name="configuration_telegram"></a>
### Telegram

Grab yourself a Telegram Bot Token from [@botfather](https://telegram.me/BotFather).
For further help see [Telegram Bot API](https://core.telegram.org/bots/api).
If you successfully registered your bot insert the Token into your `config.json`

<a name="configuration_bing"></a>
### Bing

To search for images the bot needs access to Bings Image API.
Get yourself a API key at [Bing Image Search API](https://www.microsoft.com/cognitive-services/en-us/bing-image-search-api) and insert it into your `config.json`

#### Optional configuration

- `count` - Specifies from how many results the bot chooses a random image (default: `1000`)
- `market` - Choose the market where the results come from (default: `en-en`)


<a name="configuration_bing"></a>
### Bot configuration

In the bot section of the configuration file you may specify if the bot serves nsfw content or not.


## Running

Just run
```
node app.js
```
