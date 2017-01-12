The average, per month, of the results of an elaborate calculation of over 100 scenarios featuring combinations of the following variables:

* monthly price per gallon of gasoline ($1.737 - $3.932)
* days per week working from home (1-2)
* days per week I might get the secret free parking spot (1-3)
* work days per year (accounting for PTO, 229)
* primary vehicle MPG (25, 16, or 20)
* miles (36 per day on the driving route)
* employer's monthly parking subsidy ($100 if monthly parking fee is paid in advance)
* on-street or lot vs garage parking ($4 - $22)
* health insurance premium savings ($300/yr)
* auto maintenance savings ($500/yr)
* gym membership savings ($200/yr)
* and more

**Data Sources**: Gas (CouchDB), Variables (JSON)\*<br/>
**YADA Features**: RESTAdaptor<br/>
**How it works**: The regional monthly gas price data is retrieved from the Bureau of Labor Statistics and stored in CouchDB. The CouchDB data is retrieved via the [BLSCDB all rows](http://localhost:8081/yada/q/BLSCDB%20all%20rows/r/RESTPassThruResponse) query and then transformed into a JavaScript object, with year-month (YYYYMM) keys, and USD price values.  This map is then combined with a handful of constants and variables, as mentioned above, to calculate a range of nearly 200 possible daily car-commuting cost values, the average of which, for each month, is depicted in the visualization.

These averages are then used to estimate the total costs offset by bicycle commuting, to justify cycling expenses, and to estimate overall savings.

The formula:



$$
cost_{day}=\frac{\sum_{i=1}^{n} (p_{y_i} + c_{y_i} + b_{y_i} + C_m + F + L)}{n}
$$
where
$$\begin{eqnarray}
\forall h \in \{0\dots H_{max}\}:d_w&=&D'-W*h/2, \\
m_y&=&d_w*M \\
\forall g(k,v) \in G:g_c&=&v \mid C_{ds}<=k<C_{de} \\
\forall c \in C_g:c_y&=&m_y/c*g_c \\
\forall s \in \{0,S\}:s_m&=&s \\
s_y&=&s_m*T \\
\forall p \in P: s_m&=&0\rightarrow p_{min} = P_{max}, \\
s_m&=&1\rightarrow p_{min} = P_{min} \wedge p_{max} = P_{max} \\
\forall k \in K: s_m&=&0 \wedge k < 8 \rightarrow k_d = 0,\ else\ k_d = k, \\
s_m&=&1 \rightarrow k_d = k \\
K_s &\subset& \{k\mid k_{d_{min}} <= k <= k_{d_{max}} \} \\
\forall p \in \{p_{min}\dots p_{max}\}:p_y&=&p*k*W < s_y \rightarrow 0,\ else\ p_y=p*k*W \\
b_y&=&B*d \\
n&=&H_{max}*2*(p_{max}-p_{min})*|K_s| \\
\\
H_{max}&=&\text{Maximum days/week working at home} = 2 \\
P&=&\text{Paid parking days/week} = \{0\dots5\} \\
P_{min}&=&text{Minimum paid parking days/week} = 2 \\
P_{max}&=&text{Maximum paid parking days/week} = 5 \\
K &=&text{Costs of parking/day} = \{4,6,8,13,14,15,16,17,18,19,20\} \\
S &=&text{Monthly parking subsidy} = 100 \\
\\
D&=&text{Days per year} = 365 \\
W&=&text{Weeks per year} = 52 \\
T&=&text{Months per year} = 12 \\
V_h&=&text{Paid holiday} = 12 \\
V_p&=&text{Paid personal day} = 5 \\
V_v&=&text{Paid vacation day} = 15 \\
D'&=&D-W*2-V_h-V_p-V_v \\
\\
C&=&text{Primary vehicles} = \{``Honda Civic",``Toyota Sienna",``Nissan Rogue" \} \\
C_g&=&MPG = \{25,16,20\} \\
C_{ds}&=&Vehicle Start Date \\
C_{de}&=&Vehicle End Date \\
C_m&=&car maintenance/year=500 \\
F&=&local gym membership/year=200 \\
L&=&life insurance premium savings/year=300 \\
B&=&Health bonus per day = 2 \\
\\
V&=&Regional monthly prices/gallon of gasoline=\{See BLS data\} \\
K&=&Regional gas price months=\{July 2011 \dots current \} \\
G& \subset &\{(k,v) \mid k \in K \wedge v \in V \wedge \forall(q,w) \in G: k=q \rightarrow v=w\} = \text{Monthly gas prices} \\
M&=&Miles/day=36
\end{eqnarray}$$


\*Variables are currently entered in a JSON config file loaded at boot, but an input form could be included in the app to allow for user input and scenario testing.
