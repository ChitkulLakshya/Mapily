import { Mail, MapPin, Phone } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-background py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            About Maply
          </h1>
          <div className="w-20 h-1 bg-primary mx-auto rounded-full" />
        </div>

        {/* Content */}
        <div className="space-y-8 animate-fade-in">
          {/* Mission */}
          <div className="bg-card rounded-2xl p-8 shadow-card">
            <h2 className="text-2xl font-bold text-foreground mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Maply is dedicated to helping you discover the best local places in your city. 
              Whether you're looking for a cozy cafe to work from, a restaurant for a special 
              dinner, or a quick bite from a food truck, we've got you covered.
            </p>
          </div>

          {/* What We Offer */}
          <div className="bg-card rounded-2xl p-8 shadow-card">
            <h2 className="text-2xl font-bold text-foreground mb-4">What We Offer</h2>
            <p className="text-muted-foreground leading-relaxed text-lg mb-4">
              Our platform provides a curated collection of the finest establishments, complete 
              with ratings, descriptions, and locations. We make it easy to find exactly what 
              you're looking for with our intuitive category filters.
            </p>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start">
                <span className="text-primary mr-2 text-xl">•</span>
                <span>Comprehensive listings of cafes, restaurants, and food spots</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2 text-xl">•</span>
                <span>User ratings and detailed descriptions</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2 text-xl">•</span>
                <span>Easy-to-use category filters</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2 text-xl">•</span>
                <span>Regularly updated information</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="bg-card rounded-2xl p-8 shadow-card">
            <h2 className="text-2xl font-bold text-foreground mb-6">Get in Touch</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-foreground font-medium">hello@localspots.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="text-foreground font-medium">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="text-foreground font-medium">123 Main Street, Your City</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
