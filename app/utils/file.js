import { glob } from 'glob';

export const getFiles = async path => {
    const commands = {};
    const files = await glob(`${path}/**/*`);
    
	for (let file of files) {
		if(!file.endsWith('.js')) continue;
        file = file.replace('app\\', '');
        file = file.replaceAll('\\', '/');
        let filePath = '../' + file;
        try {
            const {data} = await import(filePath);
            if (data)
                commands[data.data?.name || data.name] = data;
        } catch (e) {
            console.warn(file.split('/').at(-1) + ' skipped');
            console.log(e);
        }
	}

    return commands;
}