
class Timer {
    
    constructor () {
        this.blocks = {};
    }
    
    start (block_name) {
        if (!this.blocks[block_name]) {
            this.blocks[block_name] = {
                time: 0,
                start: [];
            };
        }
        this.blocks[block_name].start.push(Date.now());
    }
    
    stop (block_name) {
        
        this.blocks[block_name].time += Date.now() - this.blocks[block_name].start.pop();
    }
    
    get (block_name) {
        return this.blocks[block_name].time || 0;
    }
    
    toString () {
        let times = [];
        for (let block_name in this.blocks) {
            times.push(`${block_name}: ${this.get(block_name)} ms`);
        }
        return times.join('\n');
    }
}

module.exports = new Timer();