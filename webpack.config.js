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

// Base algorithms, needed by others
const algorithms = [
    'Algorithm',
    'Graph',
    'Hash',
    'Recursive',
]

// Optional algorithms, comment out those you don't need
algorithms.push(
    // 'AVL',
    // 'BFS',
    'BST',
    // 'BinomialQueue',
    // 'BPlusTree',
    // 'BST',
    // 'BTree',
    // 'BucketSort',
    // 'ChangingCoordinate2D',
    // 'ChangingCoordinate3D',
    // 'ClosedHashBucket',
    // 'ClosedHash',
    // 'ComparisonSort',
    // 'ConnectedComponent',
    // 'CountingSort',
    // 'DFS',
    // 'DijkstraPrim',
    // 'DisjointSet',
    // 'DPChange',
    // 'DPFib',
    // 'DPLCS',
    // 'DPMatrixMultiply',
    // 'FibonacciHeap',
    // 'Floyd',
    // 'Graph',
    // 'Hash',
    // 'Heap',
    // 'HeapSort',
    // 'Huffman',
    // 'Kruskal',
    // 'LeftistHeap',
    // 'MyAlgorithm',
    // 'OpenHash',
    // 'QueueArray',
    // 'QueueLL',
    // 'RadixSort',
    // 'RadixTree',
    // 'RecFact',
    // 'RecQueens',
    // 'RecReverse',
    // 'Recursive',
    // 'RedBlack',
    // 'RotateScale2D',
    // 'RotateScale3D',
    // 'RotateTranslate2D',
    // 'Search',
    // 'SimpleStack',
    // 'SkewHeap',
    // 'SplayTree',
    'StackArray',
    'StackLL',
    // 'TestAlgorithmOld',
    // 'TopoSortDFS',
    // 'TopoSortIndegree',
    // 'Trie',
    // 'TrinarySearchTree',
    // 'TST',
)

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