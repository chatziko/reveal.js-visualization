const path = require('path')
const fs = require('fs')
const ConcatPlugin = require('webpack-concat-plugin')
const WebpackOnBuildPlugin = require('on-build-webpack')

// animations, always needed
const animations = [
    'CustomEvents',
    'AnimatedBTreeNode',
    'AnimatedCircle',
    'AnimatedLabel',
    'AnimatedLinkedList',
    'AnimatedObject',
    'AnimatedRectangle',
    'AnimationMain',
    'HighlightCircle',
    'Line',
    'ObjectManager',
    'UndoFunctions'
]

// Algorithms, comment out those you don't need (but make sure to include base classes)
const algorithms = [
    /////// Base of all //////
    'Algorithm',

    /////// Basic ////////////
    'StackArray',
    'StackLL',
    'QueueArray',
    'QueueLL',
    'Search',

    /////// Trees //////////
    'AVL',
    'BPlusTree',
    'BST',
    'BST',
    'BTree',
    'RadixTree',
    'RedBlack',
    'SplayTree',
    'Trie',
    // 'TrinarySearchTree',
    'TST',

    /////// Heaps /////////////
    'Heap',
    'BinomialQueue',
    'FibonacciHeap',
    'LeftistHeap',
    'SkewHeap',

    /////// Recursive /////////
    'Recursive',
    'RecFact',
    'RecQueens',
    'RecReverse',

    /////// Hashing ///////////
    'Hash',
    'ClosedHashBucket',
    'ClosedHash',
    'OpenHash',

    /////// Sort ///////////////
    // 'BucketSort',
    // 'ComparisonSort',
    // 'CountingSort',
    // 'HeapSort',
    // 'RadixSort',

    /////// Graph //////////////
    'Graph',
    'BFS',
    'ConnectedComponent',
    'DFS',
    'DijkstraPrim',
    'Floyd',
    'Kruskal',
    'TopoSortDFS',
    'TopoSortIndegree',

    ///////// Misc ////////////
    // 'DisjointSet',
    // 'Huffman',

    ///////// Dynamic Programming //////
    // 'DPChange',
    // 'DPFib',
    // 'DPLCS',
    // 'DPMatrixMultiply',

    ///////// Geometric //////////////
    // 'ChangingCoordinate2D',
    // 'ChangingCoordinate3D',
    // 'RotateScale2D',
    // 'RotateScale3D',
    // 'RotateTranslate2D',
]

const files = [].concat(
    animations.map(m => `./visualization/AnimationLibrary/${m}.js`),
    algorithms.map(m => `./visualization/AlgorithmLibrary/${m}.js`),
    './visualization.js'
)

function wrapScope(file) {
    const content = fs.readFileSync(file)
    fs.writeFileSync(file, `(function(){${content}\n})()`)
}

module.exports = {
    entry: './visualization.js',        // this is not really the entry, by webpack needs one
    output: {
        path: path.resolve(__dirname, 'demo'),
    },
    mode: 'production',
    performance: {
        hints: false
    },
    plugins: [
        new ConcatPlugin({
            uglify: false,
            sourceMap: true,
            name: 'visualization',
            outputPath: 'plugin/visualization',
            fileName: '[name].js',
            filesToConcat: files,
        }),
        new ConcatPlugin({
            uglify: true,
            sourceMap: false,
            name: 'visualization.min',
            outputPath: 'plugin/visualization',
            fileName: '[name].js',
            filesToConcat: files,
        }),
        new WebpackOnBuildPlugin(function(stats) {
            // we don't really need an entry point, delete
            if(fs.existsSync('demo/main.js'))
                fs.unlinkSync('demo/main.js')

            // wrap files in a private scope
            wrapScope('demo/plugin/visualization/visualization.js')
            wrapScope('demo/plugin/visualization/visualization.min.js')
        }),
    ]
}