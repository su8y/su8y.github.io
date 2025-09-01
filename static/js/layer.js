export const lightMapStyleObject = {
    version: 8,
    sources: {
        'vworld-source': {
            type: 'raster',
            tiles: [`https://api.vworld.kr/req/wmts/1.0.0/${config.apikey}/Base/{z}/{y}/{x}.png`],
            tileSize: 256,
            attribution: '© <a href="https://www.vworld.kr/">V-World</a>'
        }
    },
    layers: [{'id': 'vworld-layer', 'type': 'raster', 'source': 'vworld-source'}]
};

export const darkMapStyleObject = {
    version: 8,
    sources: {
        'vworld-source': {
            type: 'raster',
            tiles: [`https://api.vworld.kr/req/wmts/1.0.0/${config.apikey}/midnight/{z}/{y}/{x}.png`],
            tileSize: 256,
            attribution: '© <a href="https://www.vworld.kr/">V-World</a>'
        }
    },
    layers: [{'id': 'vworld-layer', 'type': 'raster', 'source': 'vworld-source'}]
};
