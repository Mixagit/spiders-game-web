// const ROW = 4;
// const COL = 4;
//
// // Direction vectors
// const dRow = [-1, 0, 1, 0];
// const dCol = [0, 1, 0, -1];
//
// function isValid(vis, row, col) {
//     if (row < 0 || col < 0 || row >= ROW || col >= COL)
//         return false;
//     if (vis[row][col])
//         return false;
//     return true;
// }
//
// function BFS(grid, vis,row, col) {
//     const q = [];
//
//     q.push([row, col]);
//     vis[row][col] = true;
//
//     while (q.length !== 0) {
//
//         const cell = q[0];
//         const x = cell[0];
//         const y = cell[1];
//
//         // this.pos_x += Math.floor(x * this.speed);
//         // this.pos_y += Math.floor(y * this.speed);
//         document.write( grid[x][y] + " ");
//
//         q.shift();
//
//         for (let i = 0; i < 4; i++) {
//
//             const adjX = x + dRow[i];
//             const adjY = y + dCol[i];
//
//             if (isValid(vis, adjX, adjY)) {
//                 q.push([adjX, adjY ]);
//                 vis[adjX][adjY] = true;
//             }
//         }
//     }
// }
//
// const grid = [[1, 2, 3, 4 ],
//     [5, 6, 7, 8 ],
//     [9, 10, 11, 12 ],
//     [13, 14, 15, 16 ] ];
// // Declare the visited array
// const vis = Array.from(Array(ROW), ()=> Array(COL).fill(false));
// BFS(grid, vis, 0, 0);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
// function get_next_nodes(x, y){
//     const check_next_node = x >= 0 && x < 20 && y >= 0 && y < 30 && !grid[y][x];
//     const ways = [[-1, 0], [0, -1], [1, 0], [0, 1], [-1, -1], [1, -1], [1, 1], [-1, 1]];
//     for ()
//
// }
// //     // check_next_node = lambda x, y: True if 0 <= x < cols and 0 <= y < rows and not grid[y][x] else False
// //     ways = [-1, 0], [0, -1], [1, 0], [0, 1], [-1, -1], [1, -1], [1, 1], [-1, 1]
// //     return [(x + dx, y + dy) for dx, dy in ways if check_next_node(x + dx, y + dy)]
//
// // def bfs(start, goal, graph):
// //     queue = deque([start])
// //     visited = {start: None}
// //
// //     while queue:
// //         cur_node = queue.popleft()
// //         if cur_node == goal:
// //             break
// //
// //     next_nodes = graph[cur_node]
// //     for (next_node in next_nodes) {
// //         if (next_node not in visited){
// //             queue.append(next_node)
// //             visited[next_node] = cur_node
// //         }
// //     }
// //     return queue, visited
//
// function bfs(start, goal, graph) {
//     const queue = [start];
//     const visited = {
//         start: null
//     };
//
//     while (queue) {
//         const cur_node = queue.shift();
//         if (cur_node === goal)
//             break;
//         const next_nodes = graph[cur_node];
//         for (let next_node in next_nodes) {
//             if (!visited.includes(next_node)) {
//                 queue.push(next_node);
//                 visited[next_node] = cur_node;
//             }
//         }
//     }
//
//     return [queue, visited];
// }