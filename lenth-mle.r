library(MASS) # ginv()
lenth <- function(xy, theta, x.hat=NULL, i.max=1000, threshold=10.0^(-6)) {
  norm2 <- function(v) sum(v*v)
  #
  # Pseudo-MLE.
  #
  improve <- function(x, cs, xy){
    #
    # Improves an initial estimate `x` based on bearings as represented
    # by a 2 x * matrix of cosines and sines `cs` relative to locations `xy` 
    # (as a 2 by * matrix).
    #
    if (is.null(x)) {
      cs.star <- cs                                          # Starting estimate
    }
    else {
      xy.relative <- apply(xy, 2, function(v) x-v)           # vectors towards x
      d <- apply(xy.relative, 2, function(v) norm2(v)^(3/2)) # cubed distances
      cs.star <- xy.relative / d                             # direction cosines
    }
    z <- cs[2,]*xy[1,] - cs[1,]*xy[2,]                     
    a <- cs.star %*% t(cs) * matrix(c(-1,-1,1,1), nrow=2)    # Eq 2.6, lhs
    b <- cs.star %*% z                                       # Eq 2.6, rhs
    u <- solve(a,b)                                          # Solution
    c(u[2], u[1])
  }
  #
  # Convert bearings into direction cosines and sines.
  #
  cs <- sapply(theta, function(x) c(cos(x), sin(x)))
  #
  # Iterate until convergence.
  #
  if (is.null(x.hat)) x.hat <- improve(x.hat, cs, xy)
  repeat {
    x.new <- improve(x.hat, cs, xy)
    eps <- norm2(x.hat-x.new) / sqrt(max(apply(xy, 2, norm2)))
    lines(t(cbind(x.hat, x.new)), pch=2, col="Red")
    x.hat <- x.new
    i.max <- i.max - 1
    if (eps <= threshold) break
    if (i.max < 0) stop("Convergence failed.")
  }
  #
  # Estimate kappa.
  #
  mu.hat <- apply(x.hat - xy, 2, function(u) atan2(u[2], u[1]))
  c.bar <- mean(cos(theta - mu.hat))
  kappa.inv <- 2*(1-c.bar) + (1-c.bar)^2 * (0.48794/c.bar - 0.82905 - 1.3915*c.bar)
  kappa <- 1/kappa.inv
  #
  # Estimate the covariance matrix for x.hat.
  #
  xy.relative <- apply(xy, 2, function(v) x.hat - v)
  d <- apply(xy.relative, 2, function(v) norm2(v)^(3/2)) 
  cs.star <- xy.relative / d  
  q.hat <- cs.star %*% t(cs)
  q.hat <- (q.hat + t(q.hat))/2
  q.hat <- q.hat * matrix(c(1,-1,-1,1), nrow=2)
  q.hat <- q.hat[2:1, 2:1]
  q.hat <- ginv(q.hat, tol=10^(-16)) * kappa.inv
  x.se <- sqrt(q.hat[1,1])
  y.se <- sqrt(q.hat[2,2])

  list(x.hat=x.hat, cov=q.hat, se=c(x.se, y.se), kappa=kappa)
}
#--------------------------------------------------------------------------------------#
set.seed(17)
#
# Target point.
#
x.0 <- c(1, 1)
#
# Observation points.
#
n <- 16
xy <- matrix(rnorm(2*n), nrow=2)
cs <- sapply(theta, function(x) c(cos(x), sin(x)))
#
# Simulate the observed bearings (in radians)
#
xy.fuzzy <- matrix(rnorm(2*n, sd=0.2), nrow=2) + x.0
theta <- apply(xy.fuzzy - xy, 2, function(u) atan2(u[2], u[1]))
#
# Obtain the MLE.
#
fit <- lenth(xy, theta)
#
# Plot all points.
#
cs <- sapply(theta, function(x) c(cos(x), sin(x)))
par(mfrow=c(1,1))
plot(t(cbind(xy, fit$x.hat, x.0)), asp=1, type="n", xlab="x", ylab="y")
    temp <- sapply(1:length(theta), 
               function(i) lines(t(cbind(xy[,i], xy[,i]+9*cs[,i])), col="Gray"))
    points(t(xy))
    points(x.0[1], x.0[2], pch=19, col="Blue") 
    points(t(fit$x.hat), pch=19, col="Red")
#
# Plot the 95% confidence ellipse.
#
lines(ellipse(fit$cov, centre=fit$x.hat, level=0.95), col="#AA4444")