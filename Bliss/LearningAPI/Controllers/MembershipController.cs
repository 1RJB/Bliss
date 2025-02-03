using BlissAPI.Models;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;

namespace BlissAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MembershipController : ControllerBase
    {
        private readonly MyDbContext _context;

        public MembershipController(MyDbContext context)
        {
            _context = context;
        }

        // GET: api/Membership
        [HttpGet]
        public ActionResult<IEnumerable<Membership>> GetMemberships()
        {
            return _context.Memberships.ToList();
        }

        // GET: api/Membership/5
        [HttpGet("{id}")]
        public ActionResult<Membership> GetMembership(int id)
        {
            var membership = _context.Memberships.Find(id);

            if (membership == null)
            {
                return NotFound();
            }

            return membership;
        }
    }
}
