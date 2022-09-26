import * as fs from 'fs';

import { generateHTMLPage } from '@hint/utils-create-server';
import { getHintPath, HintTest, testHint } from '@hint/utils-tests-helpers';
import { Severity } from '@hint/utils-types';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const hintPath = getHintPath(__filename);

// Images

const appleTouchIconLinkTag = '<link rel="apple-touch-icon" href="/apple-touch-icon.png">';
/* eslint-disable no-sync */
const image152x152 = fs.readFileSync(`${__dirname}/fixtures/apple-touch-icon152x152.png`);
const image167x167 = fs.readFileSync(`${__dirname}/fixtures/apple-touch-icon167x167.png`);
const image180x180 = fs.readFileSync(`${__dirname}/fixtures/apple-touch-icon180x180.png`);
const imageThatIsNotSquare = fs.readFileSync(`${__dirname}/fixtures/not-square.png`);
const imageWithIncorrectDimensions100x100 = fs.readFileSync(`${__dirname}/fixtures/incorrect-dimensions100x100.png`);
const imageWithIncorrectDimensions200x200 = fs.readFileSync(`${__dirname}/fixtures/incorrect-dimensions200x200.png`);
const imageWithIncorrectFileFormat = fs.readFileSync(`${__dirname}/fixtures/incorrect-file-format.png`);
/* eslint-enable no-sync */

// Error messages
const elementHasEmptyHrefAttributeErrorMessage = `The 'apple-touch-icon' link element should have a non-empty 'href' attribute.`;
const elementHasIncorrectRelAttributeErrorMessage = `The 'apple-touch-icon' link element should have 'rel="apple-touch-icon"'.`;
const elementNotSpecifiedErrorMessage = `The 'apple-touch-icon' link element was not specified.`;
const elementNotSpecifiedInHeadErrorMessage = `The 'apple-touch-icon' link element should be specified in the '<head>'.`;
const fileCouldNotBeFetchedErrorMessage = `The 'apple-touch-icon' could not be fetched (status code: 404).`;
const fileHasIncorrectSizeErrorMessage = `The 'apple-touch-icon' size is not recommended. Size should be 120x120, 152x152, 167x167, or 180x180.`;
const fileIsInvalidPNGErrorMessage = `The 'apple-touch-icon' should be a valid PNG image.`;
const fileIsNotPNGErrorMessage = `The 'apple-touch-icon' should be a PNG image.`;
const fileRequestFailedErrorMessage = `The 'apple-touch-icon' could not be fetched (request failed).`;
const elementDuplicatedErrorMessage = `The 'apple-touch-icon' link element is not needed as one was already specified.`;

const generateImageData = (content: Buffer = image180x180): Object => {
    return {
        content,
        headers: { 'Content-Type': 'image/png' }
    };
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const tests: HintTest[] = [
    {
        name: `Resource is not an HTML document`,
        serverConfig: { '/': { headers: { 'Content-Type': 'image/png' } } }
    },
    {
        name: `'apple-touch-icon' is not specified and no manifest in page`,
        serverConfig: generateHTMLPage('<link>')
    },
    {
        name: `'apple-touch-icon' is not specified and manifest in page`,
        reports: [{
            message: elementNotSpecifiedErrorMessage,
            severity: Severity.error
        }],
        serverConfig: generateHTMLPage('<link rel="manifest" href="manifest.webmanifest">')
    },
    {
        name: `'apple-touch-icon' has 'rel="apple-touch-icon-precomposed"`,
        reports: [{
            message: elementHasIncorrectRelAttributeErrorMessage,
            severity: Severity.warning
        }],
        serverConfig: {
            '/': generateHTMLPage('<link rel="apple-touch-icon-precomposed" href="/apple-touch-icon-precomposed.png">'),
            '/apple-touch-icon-precomposed.png': generateImageData()
        }
    },
    {
        name: `'apple-touch-icon' has 'rel="apple-touch-icon-precomposed apple-touch-icon"`,
        reports: [{
            message: elementHasIncorrectRelAttributeErrorMessage,
            severity: Severity.warning
        }],
        serverConfig: {
            '/': generateHTMLPage('<link rel="apple-touch-icon-precomposed apple-touch-icon" href="/apple-touch-icon-precomposed.png">'),
            '/apple-touch-icon-precomposed.png': generateImageData()
        }
    },
    {
        name: `'apple-touch-icon' has no 'href' attribute`,
        reports: [{
            message: elementHasEmptyHrefAttributeErrorMessage,
            severity: Severity.error
        }],
        serverConfig: generateHTMLPage('<link rel="apple-touch-icon">')
    },
    {
        name: `'apple-touch-icon' has 'href' attribute with no value`,
        reports: [{
            message: elementHasEmptyHrefAttributeErrorMessage,
            severity: Severity.error
        }],
        serverConfig: generateHTMLPage('<link rel="apple-touch-icon" href>')
    },
    {
        name: `'apple-touch-icon' has 'href' attribute with the value of empty string`,
        reports: [{
            message: elementHasEmptyHrefAttributeErrorMessage,
            severity: Severity.error
        }],
        serverConfig: generateHTMLPage('<link rel="apple-touch-icon" href="">')
    },
    {
        name: `'apple-touch-icon' is used correctly`,
        serverConfig: {
            '/': generateHTMLPage('<LINk ReL="  APPLE-touch-ICON" HrEf="/apple-touch-icon.png">'),
            '/apple-touch-icon.png': generateImageData()
        }
    },
    {
        name: `'apple-touch-icon' is not PNG`,
        reports: [{
            message: fileIsNotPNGErrorMessage,
            severity: Severity.error
        }],
        serverConfig: {
            '/': generateHTMLPage(appleTouchIconLinkTag),
            '/apple-touch-icon.png': generateImageData(imageWithIncorrectFileFormat)
        }
    },
    {
        name: `'apple-touch-icon' is not an image`,
        reports: [{
            message: fileIsInvalidPNGErrorMessage,
            severity: Severity.error
        }],
        serverConfig: {
            '/': generateHTMLPage(appleTouchIconLinkTag),
            '/apple-touch-icon.png': generateHTMLPage()
        }
    },
    {
        name: `'apple-touch-icon' is not 180x180px`,
        reports: [{
            message: fileHasIncorrectSizeErrorMessage,
            severity: Severity.error
        }],
        serverConfig: {
            '/': generateHTMLPage(appleTouchIconLinkTag),
            '/apple-touch-icon.png': generateImageData(imageWithIncorrectDimensions100x100)
        }
    },
    {
        name: `'apple-touch-icon' is not 180x180px and it's also not square`,
        reports: [{
            message: fileHasIncorrectSizeErrorMessage,
            severity: Severity.error
        }],
        serverConfig: {
            '/': generateHTMLPage(appleTouchIconLinkTag),
            '/apple-touch-icon.png': generateImageData(imageThatIsNotSquare)
        }
    },
    {
        name: `'apple-touch-icon' could not be fetched`,
        reports: [{
            message: fileCouldNotBeFetchedErrorMessage,
            severity: Severity.error
        }],
        serverConfig: {
            '/': generateHTMLPage(appleTouchIconLinkTag),
            '/apple-touch-icon.png': { status: 404 }
        }
    },
    {
        name: `'apple-touch-icon' file request failed`,
        reports: [{
            message: fileRequestFailedErrorMessage,
            severity: Severity.error
        }],
        serverConfig: {
            '/': generateHTMLPage(appleTouchIconLinkTag),
            '/apple-touch-icon.png': null
        }
    },
    {
        name: `'apple-touch-icon' is specified in the '<body>'`,
        reports: [{
            message: elementNotSpecifiedInHeadErrorMessage,
            severity: Severity.error
        }],
        serverConfig: {
            '/': generateHTMLPage(undefined, appleTouchIconLinkTag),
            '/apple-touch-icon.png': generateImageData()
        }
    },
    {
        name: `Multiple 'apple-touch-icon's are specified`,
        serverConfig: {
            '/': generateHTMLPage(`
                <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png">
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png">
                <link rel="apple-touch-icon" href="/apple-touch-icon.png">
            `),
            '/apple-touch-icon-152x152.png': generateImageData(image152x152),
            '/apple-touch-icon-180x180.png': generateImageData(image180x180),
            '/apple-touch-icon.png': generateImageData(image167x167)
        }
    },
    {
        name: `Multiple 'apple-touch-icon's are specified (one with not recommended size)`,
        reports: [{
            message: fileHasIncorrectSizeErrorMessage,
            severity: Severity.warning
        }],
        serverConfig: {
            '/': generateHTMLPage(`
                <link rel="apple-touch-icon" sizes="100x100" href="/apple-touch-icon-100x100.png">
                <link rel="apple-touch-icon" href="/apple-touch-icon.png">
            `),
            '/apple-touch-icon-100x100.png': generateImageData(imageWithIncorrectDimensions100x100),
            '/apple-touch-icon.png': generateImageData()
        }
    },
    {
        name: `Multiple 'apple-touch-icon's are specified (no recommended sizes)`,
        reports: [{
            message: fileHasIncorrectSizeErrorMessage,
            severity: Severity.error
        }, {
            message: fileHasIncorrectSizeErrorMessage,
            severity: Severity.error
        }],
        serverConfig: {
            '/': generateHTMLPage(`
                <link rel="apple-touch-icon" sizes="100x100" href="/apple-touch-icon-100x100.png">
                <link rel="apple-touch-icon" href="/apple-touch-icon.png">
            `),
            '/apple-touch-icon-100x100.png': generateImageData(imageWithIncorrectDimensions100x100),
            '/apple-touch-icon.png': generateImageData(imageWithIncorrectDimensions200x200)
        }
    },
    {
        name: `Duplicated 'apple-touch-icon's are specified`,
        reports: [{
            message: elementDuplicatedErrorMessage,
            severity: Severity.warning
        }],
        serverConfig: {
            '/': generateHTMLPage(`
                <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png">
                <link rel="apple-touch-icon" href="/apple-touch-icon.png">
                <link rel="apple-touch-icon" href="/apple-touch-icon.png">
            `),
            '/apple-touch-icon-152x152.png': generateImageData(image152x152),
            '/apple-touch-icon.png': generateImageData()
        }
    }
];

testHint(hintPath, tests);
