const { fetchImageForSlide } = require('./config/ai');

async function test() {
    console.log('Testing relevant image fetch...\n');
    
    const keywords = [
        'network cables technology',
        'physical layer networking',
        'data transmission signals',
        'fiber optic cables',
        'server room data center'
    ];
    
    for (const keyword of keywords) {
        try {
            const url = await fetchImageForSlide(keyword);
            console.log(`\n"${keyword}":`);
            console.log(`  URL: ${url}`);
        } catch (error) {
            console.error(`  Error: ${error.message}`);
        }
    }
}

test();
