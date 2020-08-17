const Jimp = require('jimp');
const inquirer = require('inquirer');
const fs = require('fs');
const watermarkChoices = ['Text watermark', 'Image watermark'];
const imageEditChoices = ['make image brighter', 'increase contrast', 'make image b&w', 'invert image'];

const addTextWatermarkToImage = async function(inputFile, outputFile, text) {
    try {
        const image = await Jimp.read(inputFile);
        const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
        const textData = {
            text,
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
        };

        image.print(font, 0, 0, textData, image.getWidth(), image.getHeight());
        await image.quality(100).writeAsync(outputFile);
        console.log ('Ekhm... Here is 2020 again...oh wait, SUCCES! Weird...');
        startApp();
    }
    catch(error) {
        console.log('Ekhm... here is 2020 again...something went wrong. Try again!');
    }
};

const addImageWaterMarkToImage = async function(inputFile, outputFile, watermarkFile) {
    try {
        const image = await Jimp.read(inputFile);
        const watermark = await Jimp.read(watermarkFile); 
        const x = image.getWidth() / 2 - watermark.getWidth() / 2;
        const y = image.getHeight() / 2 - watermark.getHeight() / 2;


        image.composite(watermark, x, y, {
            mode: Jimp.BLEND_SOURCE_OVER,
            opacitySource: 0.5,
        });

        await image.quality(100).writeAsync(outputFile);
        console.log ('Ekhm... Here is 2020 again...oh wait, SUCCES! Weird...');
        startApp();
    }
    catch(error) {
        console.log('Ekhm... here is 2020 again...something went wrong. Try again!');
    }
};

const prepareOutputFilename = filename => {
    const [name, ext] = filename.split('.');
    const outputFilename = `${name}-with-watermark.${ext}`;

    return outputFilename;
};

const startApp = async () => {
    
    //Ask if user is ready
    const answer = await inquirer.prompt([{
        name: 'start',
        message: 'Welcome to "Watermark manager". Copy your images to `/img` folder. After that you will be able to use them in the app. Are you ready?',
        type: 'confirm',
    }]);

    //if answer is no, quit the app
    if(!answer.start) process.exit();

    //ask about input file and watermark type
    const options = await inquirer.prompt([{
        name: 'inputImage',
        type: 'input',
        message: 'What file do you want to mark?',
        default: 'test.jpg',
    }, {
        name: 'imageChanges',
        message: 'Do you want to edit your image?',
        type: 'confirm',
    }, {
        name: 'watermarkType',
        type: 'list',
        choices: [watermarkChoices[0], watermarkChoices[1]],
    }]);

    if (options.imageChanges) {
        const image = await Jimp.read('./img/' + options.inputImage);

        const changesList = await inquirer.prompt([{
            name: 'changeType',
            type: 'list',
            choices: [imageEditChoices[0], imageEditChoices[1], imageEditChoices[2], imageEditChoices[3]],
        }]);

        if (changesList.changeType === imageEditChoices[0]) {
            image.brightness(0.3);
            await image.quality(100).writeAsync('./img/' + options.inputImage);
        }
        if (changesList.changeType === imageEditChoices[1]) {
            image.contrast(0.3);
            await image.quality(100).writeAsync('./img/' + options.inputImage);
        }
        if (changesList.changeType === imageEditChoices[2]) {
            image.greyscale();
            await image.quality(100).writeAsync('./img/' + options.inputImage);
        }
        if (changesList.changeType === imageEditChoices[3]) {
            image.invert();
            await image.quality(100).writeAsync('./img/' + options.inputImage);
        }
    }

    //ask about path to watermark image or text to watermark text

    if (options.watermarkType === watermarkChoices[0]) {
        const text = await inquirer.prompt([{
            name: 'value',
            type: 'input',
            message: 'Type your watermark text:',
        }]);

        options.watermarkText = text.value;

        if (fs.existsSync('./img/' + options.inputImage)) {
            addTextWatermarkToImage('./img/' + options.inputImage, prepareOutputFilename(options.inputImage), options.watermarkText);
        }
        else {
            console.log('Ekhm... here is 2020 again...something went wrong');
        }
    }
    else {
        const image = await inquirer.prompt([{
            name: 'filename',
            type: 'input',
            message: 'Type your watermark filename:',
            default: 'logo.png',
        }]);

        options.watermarkImage = image.filename;
        if ((fs.existsSync('./img/' + options.inputImage)) && (fs.existsSync(options.watermarkImage))) {
            addImageWaterMarkToImage('./img/' + options.inputImage, prepareOutputFilename(options.inputImage), options.watermarkImage);
        }
        else {
            console.log('Ekhm... here is 2020 again...something went wrong');
        }
    }
}

startApp();


