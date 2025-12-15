# game_logic.py
import random
import collections # for BFS
import heapq # for Dijkstra's algorithm


class SnakeLadderGame:
    def __init__(self, n):
        self.N = n
        self.board_size = n * n
        self.snakes = {} # initialize an empty dictionary to map snake start → snake end
        self.ladders = {}
        self._generate_board() # populate snakes and ladders

    def _generate_board(self):
        num_items = self.N - 2
        occupied = {1, self.board_size}

        # Ladders
        count = 0
        while count < num_items:
            s, e = sorted(random.sample(range(2, self.board_size), 2))
            if s not in occupied and e not in occupied:
                self.ladders[s] = e
                occupied.update({s, e})
                count += 1

        # Snakes
        count = 0
        while count < num_items:
            e, s = sorted(random.sample(range(2, self.board_size), 2))  # snake: s > e
            if s not in occupied and e not in occupied:
                self.snakes[s] = e
                occupied.update({s, e})
                count += 1

    def get_dest(self, cell): # returns the destination cell after applying snakes/ladders
        if cell in self.ladders:
            return self.ladders[cell]
        if cell in self.snakes:
            return self.snakes[cell]
        return cell

    def solve_bfs(self):   # BFS approach to find minimum dice throws
        queue = collections.deque([(1, 0)])
        visited = {1}

        while queue:
            curr, throws = queue.popleft()
            if curr == self.board_size:
                return throws

            for dice in range(1, 7):
                nxt = curr + dice
                if nxt <= self.board_size:
                    final = self.get_dest(nxt)
                    if final not in visited:
                        visited.add(final)
                        queue.append((final, throws + 1))
        return 0

    def solve_dijkstra(self): # Dijkstra's algorithm approach to find minimum dice throws
        pq = [(0, 1)]
        dists = {i: float('inf') for i in range(1, self.board_size + 1)}
        dists[1] = 0

        while pq:
            d, curr = heapq.heappop(pq)
            if curr == self.board_size:
                return d

            if d > dists[curr]:
                continue

            for dice in range(1, 7):
                nxt = curr + dice
                if nxt <= self.board_size:
                    final = self.get_dest(nxt)
                    if d + 1 < dists[final]:
                        dists[final] = d + 1
                        heapq.heappush(pq, (d + 1, final))
        return 0
