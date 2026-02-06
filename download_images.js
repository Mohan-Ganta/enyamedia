const https = require('https');
const fs = require('fs');
const path = require('path');

const images = [
    { url: 'https://images.weserv.nl/?url=img.youtube.com/vi/zFk3w2yJzBg/hqdefault.jpg&output=jpg', name: 'hero_mayabazar.jpg' },
    { url: 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/8/8c/Gundammakatha.jpg&output=jpg', name: 'gundamma_katha.jpg' },
    { url: 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/1/18/Missamma_poster.jpg&output=jpg', name: 'missamma.jpg' },
    { url: 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/9/91/Jagadeka_Veeruni_Katha_poster.jpg&output=jpg', name: 'jagadeka_veeruni_katha.jpg' },
    { url: 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/d/d7/Pathala_Bhairavi_poster.jpg&output=jpg', name: 'pathala_bhairavi.jpg' },
    { url: 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/3/36/Daana_Veera_Soora_Karna_poster.jpg&output=jpg', name: 'dvsk.jpg' },
    { url: 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/e/e0/Lava_Kusa_poster.jpg&output=jpg', name: 'lava_kusa.jpg' },
    { url: 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/3/30/Bhakta_Prahlada_1967_poster.jpg&output=jpg', name: 'bhakta_prahlada.jpg' },
    { url: 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/a/a2/Sankarabharanam_poster.jpg&output=jpg', name: 'sankarabharanam.jpg' },
    { url: 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/en/3/3b/Swathi_Muthyam_poster.jpg&output=jpg', name: 'swathi_muthyam.jpg' },
    { url: 'https://images.weserv.nl/?url=upload.wikimedia.org/wikipedia/commons/e/e9/Mayabazar_film_poster.jpeg&output=jpg', name: 'mayabazar.jpg' }
];

const downloadDir = path.join(__dirname, 'public', 'movies');

if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true });
}

console.log('Starting downloads to:', downloadDir);

const fallback = (img, reason) => {
    console.log(`! Failed ${img.name} (${reason}). Using fallback.`);
    const filePath = path.join(downloadDir, img.name);
    // Use a solid color placeholder with text
    const text = encodeURIComponent(img.name.replace('.jpg', '').replace(/_/g, ' ').toUpperCase());
    const fallbackUrl = `https://placehold.co/600x900/222222/EDEDED.jpg?text=${text}&font=roboto`;

    // Download fallback
    const file = fs.createWriteStream(filePath);
    https.get(fallbackUrl, (res) => {
        res.pipe(file);
        file.on('finish', () => {
            file.close();
            console.log(`  -> Saved fallback for ${img.name}`);
        });
    }).on('error', (err) => {
        console.error(`  -> Fallback also failed for ${img.name}: ${err.message}`);
    });
}

const downloadImage = (img) => {
    const filePath = path.join(downloadDir, img.name);
    const file = fs.createWriteStream(filePath);

    const options = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    };

    console.log(`Downloading ${img.name}...`);

    const request = https.get(img.url, options, response => {
        // Follow redirects
        if (response.statusCode === 301 || response.statusCode === 302) {
            https.get(response.headers.location, options, (res) => {
                if (res.statusCode !== 200) {
                    file.close();
                    fs.unlink(filePath, () => { });
                    fallback(img, `Redirect Status ${res.statusCode}`);
                    return;
                }
                res.pipe(file);
                file.on('finish', () => {
                    file.close();
                    const stats = fs.statSync(filePath);
                    if (stats.size === 0) {
                        fallback(img, "0 Byte File (Redirect)");
                    } else {
                        console.log(`✓ Downloaded ${img.name}`);
                    }
                });
            }).on('error', (err) => {
                file.close();
                fallback(img, err.message);
            });
            return; // Initial request handled
        }

        if (response.statusCode !== 200) {
            file.close();
            fs.unlink(filePath, () => { });
            fallback(img, `Status Code ${response.statusCode}`);
            return;
        }

        response.pipe(file);
        file.on('finish', () => {
            file.close();
            // Check if file is empty
            try {
                const stats = fs.statSync(filePath);
                if (stats.size < 100) { // arbitrary small size check
                    fallback(img, "File too small/empty");
                } else {
                    console.log(`✓ Downloaded ${img.name}`);
                }
            } catch (e) {
                fallback(img, "File write error");
            }
        });
    });

    request.on('error', (err) => {
        file.close();
        fs.unlink(filePath, () => { });
        fallback(img, err.message);
    });
};

images.forEach(img => downloadImage(img));
